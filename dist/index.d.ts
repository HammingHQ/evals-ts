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
type InputType = {
    query: string;
} & Record<string, any>;
type OutputType = {
    response: string;
} & Record<string, any>;
type MetadataType = Record<string, any>;
interface DatasetItemValue {
    input: InputType;
    output: OutputType;
    metadata: MetadataType;
}
type DatasetItem = DatasetItemValue & {
    id: number;
};
interface Dataset {
    id: number;
    name: string;
    description?: string;
    items: DatasetItem[];
}
declare class Experiments {
    private client;
    private items;
    constructor(client: Hamming);
    run(opts: RunOptions, run: Runner): Promise<void>;
    private start;
    private end;
    private generateName;
}
type DatasetId = number;
interface RunOptions {
    dataset: DatasetId;
    name?: string;
    score?: ScoreType[];
}
type Runner = (input: InputType) => Promise<OutputType>;
declare enum ScoreType {
    "accuracy_ai" = "accuracy_ai",
    "accuracy_human" = "accuracy_human",
    "facts_compare" = "facts_compare",
    "context_recall" = "context_recall",
    "context_precision" = "context_precision",
    "hallucination" = "hallucination",
    "string_diff" = "string_diff"
}
declare const DefaultScoreTypes: ScoreType[];
declare class Datasets {
    private client;
    constructor(client: Hamming);
    load(id: DatasetId): Promise<Dataset>;
    create(opts: CreateDatasetOptions): Promise<Dataset>;
}
interface CreateDatasetOptions {
    name: string;
    description?: string;
    items: DatasetItemValue[];
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

export { type ClientOptions, type CreateDatasetOptions, type DatasetId, type DatasetItemValue, DefaultScoreTypes, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, Hamming, type InputType, type MetadataType, type OutputType, type Runner, ScoreType };
