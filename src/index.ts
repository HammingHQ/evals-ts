export enum ExperimentStatus {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  SCORING = "SCORING",
  SCORING_FAILED = "SCORING_FAILED",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export interface ClientOptions {
  apiKey: string;
  baseURL: string;
}

export interface HttpClientOptions {
  apiKey: string;
  baseURL: string;
}

export interface Experiment {
  id: number;
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
  id: number;
  experimentId: number;
  datasetItemId: number;
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

type DatasetItem = DatasetItemValue & { id: number };

interface Dataset {
  id: number;
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
    await this.client.tracing._flush(item.id);
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
    }
  }

  private async start(
    name: string,
    dataset: number,
    scoring: ScoreType[],
    metadata: MetadataType
  ): Promise<Experiment> {
    const status = ExperimentStatus.RUNNING;
    const resp = await this.client.fetch("/experiments", {
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

export type DatasetId = number;

interface RunOptions {
  dataset: DatasetId;
  name?: string;
  scoring?: ScoreType[];
  metadata?: MetadataType;
}

export type Runner = (input: InputType) => Promise<OutputType>;

export enum ScoreType {
  AccuracyAI = "accuracy_ai",
  AccuracyHuman = "accuracy_human",
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
    const resp = await this.client.fetch(`/datasets/${id}`);
    const data = await resp.json();
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

class HttpClient {
  apiKey: string;
  baseURL: string;

  constructor(opts: HttpClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseURL = this.sanitize_base_url(opts.baseURL);
  }

  private sanitize_base_url(baseURL: string): string {
    baseURL = baseURL.trim();
    if (baseURL.endsWith("/")) {
      return baseURL.slice(0, -1);
    }
    return baseURL;
  }

  fetch(input: string, init?: RequestInit | undefined): Promise<Response> {
    return fetch(this.baseURL + input, {
      ...init,
      headers: {
        ...init?.headers,
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
    });
  }
}

type TraceEvent = Record<string, unknown>;

interface LLMEventParams {
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

interface VectorSearchEventParams {
  query?: string;
  results?: Document[] | string[];
  metadata?: {
    engine?: string;
  };
}

interface Trace {
  id: number;
  experimentItemId: number;
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

  async _flush(experimentItemId: number) {
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

  LLMEvent(params: LLMEventParams): TraceEvent {
    return {
      kind: "llm",
      ...params,
    };
  }

  VectorSearchEvent(params: VectorSearchEventParams): TraceEvent {
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
}

export class Hamming extends HttpClient {
  constructor(config: ClientOptions) {
    super({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  experiments = new Experiments(this);
  datasets = new Datasets(this);
  tracing = new Tracing(this);
}
