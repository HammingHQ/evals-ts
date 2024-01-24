import { HttpClient } from "./httpClient";

export enum ExperimentStatus {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  SCORING = "SCORING",
  SCORING_FAILED = "SCORING_FAILED",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export interface Experiment {
  id: string;
  name: string;
  description?: string | null;
  datasetId: number;
  datasetVersionId?: number;
  status: ExperimentStatus;
}

export interface ExperimentItemMetrics {
  durationMs?: number;
}

export interface ExperimentItem {
  id: string;
  experimentId: string;
  datasetItemId: string;
  output: OutputType;
  metrics: ExperimentItemMetrics;
}

export interface ExperimentItemContext {
  item: ExperimentItem;
  startTs: number;
}

export type InputType = { query: string } & Record<string, any>;
export type OutputType = { response?: string } & Record<string, any>;
export type MetadataType = Record<string, any>;

export interface DatasetItemValue {
  input: InputType;
  output: OutputType;
  metadata: MetadataType;
}

type DatasetItem = DatasetItemValue & { id: string };

interface Dataset {
  id: string;
  name: string;
  description?: string;
}

type DatasetWithItems = Dataset & { items: DatasetItem[] };

class ExperimentItems {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  async start(
    experiment: Experiment,
    datasetItem: DatasetItem,
  ): Promise<ExperimentItemContext> {
    const resp = await this.client.fetch(
      `/experiments/${experiment.id}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          datasetItemId: datasetItem.id,
          output: {},
          metrics: {},
        }),
      },
    );
    const data = await resp.json();
    const item = data.item as ExperimentItem;

    const startTs = Date.now();
    return {
      item,
      startTs,
    };
  }

  async end(itemContext: ExperimentItemContext, output: OutputType) {
    const { item, startTs } = itemContext;
    const durationMs = Date.now() - startTs;
    await this.client.tracing._flush(item.id);
    // Completing the experiment item should happen after the traces are
    // flushed, since it will automatically trigger scoring.
    await this.client.fetch(
      `/experiments/${item.experimentId}/items/${item.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          output,
          metrics: {
            durationMs,
          },
        }),
      },
    );
  }
}

class Experiments {
  private client: Hamming;
  private items: ExperimentItems;

  constructor(client: Hamming) {
    this.client = client;
    this.items = new ExperimentItems(this.client);
  }

  async run(opts: RunOptions, run: Runner) {
    const { dataset: datasetId } = opts;
    const dataset = await this.client.datasets.load(datasetId);

    const {
      name = this.generateName(dataset.name),
      scoring = DefaultScoreTypes,
      metadata = {},
    } = opts;

    const experiment = await this.start(name, datasetId, scoring, metadata);
    const baseUrl = new URL(this.client.baseURL);
    const experimentUrl = `${baseUrl.origin}/experiments/${experiment.id}`;

    try {
      for (const datasetItem of dataset.items) {
        const itemContext = await this.items.start(experiment, datasetItem);
        const output = await run(datasetItem.input);
        await this.items.end(itemContext, output);
      }
    } catch (err) {
      await this.end(experiment, ExperimentStatus.FAILED);
      throw err;
    } finally {
      await this.end(experiment);
      console.log("See experiment results at:", experimentUrl);
      return { experimentUrl };
    }
  }

  private async start(
    name: string,
    dataset: DatasetId,
    scoring: ScoreType[],
    metadata: MetadataType,
  ): Promise<Experiment> {
    const status = ExperimentStatus.RUNNING;
    const resp = await this.client.fetch(`/experiments`, {
      method: "POST",
      body: JSON.stringify({
        name,
        dataset,
        status,
        scoring,
        metadata,
      }),
    });

    const data = await resp.json();
    return data.experiment as Experiment;
  }

  private async end(
    experiment: Experiment,
    status: ExperimentStatus = ExperimentStatus.FINISHED,
  ) {
    await this.client.fetch(`/experiments/${experiment.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    });
  }

  private generateName(datasetName: string): string {
    const now = new Date();
    return `Experiment for ${datasetName} - ${now.toLocaleString()}`;
  }
}

export type DatasetId = string;

interface RunOptions {
  dataset: DatasetId;
  name?: string;
  scoring?: ScoreType[];
  metadata?: MetadataType;
}

export type Runner = (input: InputType) => Promise<OutputType>;

export enum ScoreType {
  AccuracyAI = "accuracy_ai",
  FactsCompare = "facts_compare",
  ContextRecall = "context_recall",
  ContextPrecision = "context_precision",
  Hallucination = "hallucination",
  StringDiff = "string_diff",
}

export const DefaultScoreTypes = [ScoreType.StringDiff];

class Datasets {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  async load(id: DatasetId): Promise<DatasetWithItems> {
    const resp = await this.client.fetch(`/datasets/${id}`, {
      method: "GET",
    });

    let data: { dataset: DatasetWithItems };
    try {
      data = await resp.json();
    } catch (error) {
      throw new Error(`Failed to parse dataset response as JSON: ${error}`);
    }
    return data.dataset as DatasetWithItems;
  }

  async list(): Promise<Dataset[]> {
    const resp = await this.client.fetch(`/datasets`);
    const data = await resp.json();
    return data.datasets as Dataset[];
  }

  async create(opts: CreateDatasetOptions): Promise<DatasetWithItems> {
    const { name, description, items } = opts;
    const resp = await this.client.fetch("/datasets", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        items,
      }),
    });
    const data = await resp.json();
    return data.dataset as DatasetWithItems;
  }
}

export interface CreateDatasetOptions {
  name: string;
  description?: string;
  items: DatasetItemValue[];
}

type TraceEvent = Record<string, unknown>;

interface GenerationParams {
  input?: string;
  output?: string;
  metadata?: {
    model?: string;
  };
}

interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

interface RetrievalEventParams {
  query?: string;
  results?: Document[] | string[];
  metadata?: {
    engine?: string;
  };
}

interface Trace {
  id: number;
  experimentItemId: string;
  parentId?: number;
  event: TraceEvent;
}

class Tracing {
  private client: Hamming;
  private collected: TraceEvent[] = [];
  private currentLocalTraceId: number = 0;

  constructor(client: Hamming) {
    this.client = client;
  }

  private nextTraceId(): number {
    return this.currentLocalTraceId++;
  }

  async _flush(experimentItemId: string) {
    const events = this.collected;
    this.collected = [];

    const rootTrace: Trace = {
      id: this.nextTraceId(),
      experimentItemId,
      event: { kind: "root" },
    };

    const traces: Trace[] = [rootTrace];

    for (const event of events) {
      traces.push({
        id: this.nextTraceId(),
        experimentItemId,
        parentId: rootTrace.id,
        event,
      });
    }

    await this.client.fetch(`/traces`, {
      method: "POST",
      body: JSON.stringify({
        traces,
      }),
    });
  }

  private _generationEvent(params: GenerationParams): TraceEvent {
    return {
      kind: "llm",
      ...params,
    };
  }

  private _retrievalEvent(params: RetrievalEventParams): TraceEvent {
    const isString = (item: any) => typeof item === "string";
    const hasStringResults = params.results?.every(isString);
    const normalizeResult = (result: string | Document): Document => {
      if (typeof result === "string") {
        return { pageContent: result, metadata: {} };
      }
      return result;
    };

    const results = hasStringResults
      ? params.results?.map(normalizeResult)
      : params.results;

    return {
      kind: "vector",
      ...params,
      results,
    };
  }

  log(key: string, value: unknown): void;
  log(trace: TraceEvent): void;
  log(keyOrTrace: string | TraceEvent, value?: unknown): void {
    if (typeof keyOrTrace === "string") {
      this.collected.push({ [keyOrTrace]: value });
    } else {
      this.collected.push(keyOrTrace);
    }
  }

  logGeneration(params: GenerationParams): void {
    this.log(this._generationEvent(params));
  }

  logRetrieval(params: RetrievalEventParams): void {
    this.log(this._retrievalEvent(params));
  }
}

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
}
const CLIENT_OPTIONS_KEYS: (keyof ClientOptions)[] = ["apiKey", "baseURL"];

export class Hamming extends HttpClient {
  constructor(config: ClientOptions) {
    const unexpectedConfigKeys = Object.keys(config).filter(
      (key) => !CLIENT_OPTIONS_KEYS.includes(key as keyof ClientOptions),
    );

    if (unexpectedConfigKeys.length > 0) {
      console.warn(
        `WARNING: Unexpected config keys found: ${unexpectedConfigKeys.join(
          ", ",
        )}. Valid config keys are: ${CLIENT_OPTIONS_KEYS.join(
          ", ",
        )}. The unexpected keys will be ignored.`,
      );
    }

    super({
      apiKey: config.apiKey,
      baseURL: config.baseURL ?? "https://app.hamming.ai/api/rest",
    });
  }

  experiments = new Experiments(this);
  datasets = new Datasets(this);
  tracing = new Tracing(this);
}
