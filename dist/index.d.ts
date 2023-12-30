declare const sum: (a: number, b: number) => number;

declare enum ExperimentStatus {
    CREATED = "CREATED",
    RUNNING = "RUNNING",
    SCORING = "SCORING",
    SCORING_FAILED = "SCORING_FAILED",
    FINISHED = "FINISHED",
    FAILED = "FAILED"
}
interface ClientOptions {
    apiKey: string;
    baseURL: string;
}
interface Experiment {
    id: number;
    name: string;
    description?: string | null;
    datasetId: number;
    datasetVersionId?: number;
    status: ExperimentStatus;
}
interface ExperimentItemMetrics {
    durationMs: number;
}
interface ExperimentItem {
    datasetItemId: number;
    output: OutputType;
    metrics: ExperimentItemMetrics;
}
interface ExperimentItemContext {
    experiment: Experiment;
    item: ExperimentItem;
    startTs: number;
}
type InputType = Record<string, any>;
type OutputType = Record<string, any>;
type MetadataType = Record<string, any>;
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
declare class ExperimentItems {
    private client;
    constructor(client: Hamming);
    start(experiment: Experiment, datasetItem: DatasetItem): ExperimentItemContext;
    end(ctx: ExperimentItemContext, output?: OutputType): Promise<void>;
}
declare class Experiments {
    private client;
    items: ExperimentItems;
    constructor(client: Hamming);
    start(name: string, dataset: number): Promise<Experiment>;
    end(experiment: Experiment, status?: ExperimentStatus): Promise<void>;
}
declare class Datasets {
    private client;
    constructor(client: Hamming);
    load(id: number): Promise<Dataset>;
}
declare class HttpClientOptions {
    apiKey: string;
    baseURL: string;
}
declare class HttpClient {
    apiKey: string;
    baseURL: string;
    constructor(opts: HttpClientOptions);
    private sanitize_base_url;
    fetch(input: string, init?: RequestInit | undefined): Promise<Response>;
}
declare class Hamming extends HttpClient {
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
}

export { type ClientOptions, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, Hamming, type InputType, type MetadataType, type OutputType, sum };
