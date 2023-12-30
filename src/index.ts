export enum ExperimentStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  SCORING = 'SCORING',
  SCORING_FAILED = 'SCORING_FAILED',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}


export interface ClientOptions {
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
  durationMs: number;
}

export interface ExperimentItem {
  datasetItemId: number;
  output: OutputType;
  metrics: ExperimentItemMetrics;
}

export interface ExperimentItemContext {
  experiment: Experiment;
  item: ExperimentItem;
  startTs: number;
}

export type InputType = Record<string, any>;
export type OutputType = Record<string, any>;
export type MetadataType = Record<string, any>;

interface DatasetItem {
  id: number;
  input: InputType;
  output: OutputType;
  metadata: MetadataType;
}

interface Dataset {
  id: number;
  name: string;
  description?: string;
  items: DatasetItem[];
}

class ExperimentItems {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  start(
    experiment: Experiment,
    datasetItem: DatasetItem,
  ): ExperimentItemContext {
    const startTs = Date.now();
    return {
      experiment,
      item: {
        datasetItemId: datasetItem.id,
        output: {},
        metrics: {
          durationMs: 0,
        },
      },
      startTs,
    };
  }

  async end(ctx: ExperimentItemContext, output: OutputType = {}) {
    const durationMs = Date.now() - ctx.startTs;
    ctx.item.metrics.durationMs = durationMs;
    ctx.item.output = output;
    await this.client.fetch(`/experiments/${ctx.experiment.id}/items`, {
      method: 'POST',
      body: JSON.stringify(ctx.item),
    });
  }
}

class Experiments {
  private client: Hamming;

  items: ExperimentItems;

  constructor(client: Hamming) {
    this.client = client;
    this.items = new ExperimentItems(this.client);
  }

  async start(name: string, dataset: number): Promise<Experiment> {
    const status = ExperimentStatus.RUNNING;
    const resp = await this.client.fetch('/experiments', {
      method: 'POST',
      body: JSON.stringify({
        name,
        dataset,
        status,
      }),
    });
    const data = await resp.json();
    return data.experiment as Experiment;
  }

  async end(
    experiment: Experiment,
    status: ExperimentStatus = ExperimentStatus.FINISHED
  ) {
    await this.client.fetch(`/experiments/${experiment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      }),
    });
  }
}

class Datasets {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  async load(id: number): Promise<Dataset> {
    const resp = await this.client.fetch(`/datasets/${id}`);
    const data = await resp.json();
    return data.dataset as Dataset;
  }
}

class HttpClientOptions {
  apiKey: string;
  baseURL: string;
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
    if (baseURL.endsWith('/')) {
      return baseURL.slice(0, -1);
    }
    return baseURL;
  }

  fetch(input: string, init?: RequestInit | undefined): Promise<Response> {
    return fetch(this.baseURL + input, {
      ...init,
      headers: {
        ...init?.headers,
        'authorization': `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
    });
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
}
