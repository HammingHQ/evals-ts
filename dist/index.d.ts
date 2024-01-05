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
interface HttpClientOptions {
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
    durationMs?: number;
}
interface ExperimentItem {
    id: number;
    experimentId: number;
    datasetItemId: number;
    output: OutputType;
    metrics: ExperimentItemMetrics;
}
interface ExperimentItemContext {
    item: ExperimentItem;
    startTs: number;
}
type InputType = {
    query: string;
} & Record<string, any>;
type OutputType = {
    response?: string;
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
type DatasetWithItems = Dataset & {
    items: DatasetItem[];
};
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
    scoring?: ScoreType[];
}
type Runner = (input: InputType) => Promise<OutputType>;
declare enum ScoreType {
    AccuracyAI = "accuracy_ai",
    AccuracyHuman = "accuracy_human",
    FactsCompare = "facts_compare",
    ContextRecall = "context_recall",
    ContextPrecision = "context_precision",
    Hallucination = "hallucination",
    StringDiff = "string_diff"
}
declare const DefaultScoreTypes: ScoreType[];
declare class Datasets {
    private client;
    constructor(client: Hamming);
    load(id: DatasetId): Promise<Dataset>;
    list(): Promise<DatasetWithItems[]>;
    create(opts: CreateDatasetOptions): Promise<Dataset>;
}
interface CreateDatasetOptions {
    name: string;
    description?: string;
    items: DatasetItemValue[];
}
declare class HttpClient {
    apiKey: string;
    baseURL: string;
    constructor(opts: HttpClientOptions);
    private sanitize_base_url;
    fetch(input: string, init?: RequestInit | undefined): Promise<Response>;
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
declare class Tracing {
    private client;
    private collected;
    private currentLocalTraceId;
    constructor(client: Hamming);
    private nextTraceId;
    _flush(experimentItemId: number): Promise<void>;
    LLMEvent(params: LLMEventParams): TraceEvent;
    VectorSearchEvent(params: VectorSearchEventParams): TraceEvent;
    log(key: string, value: unknown): void;
    log(trace: TraceEvent): void;
}
declare class Hamming extends HttpClient {
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
    tracing: Tracing;
}

export { type ClientOptions, type CreateDatasetOptions, type DatasetId, type DatasetItemValue, DefaultScoreTypes, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, Hamming, type HttpClientOptions, type InputType, type MetadataType, type OutputType, type Runner, ScoreType };
