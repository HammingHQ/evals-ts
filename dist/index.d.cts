import { HttpClient } from './httpClient.cjs';
import './fetchClient.cjs';

declare enum ExperimentStatus {
    CREATED = "CREATED",
    RUNNING = "RUNNING",
    SCORING = "SCORING",
    SCORING_FAILED = "SCORING_FAILED",
    FINISHED = "FINISHED",
    FAILED = "FAILED"
}
interface Experiment {
    id: string;
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
    id: string;
    experimentId: string;
    datasetItemId: string;
    output: OutputType;
    metrics: ExperimentItemMetrics;
}
interface ExperimentItemContext {
    item: ExperimentItem;
    startTs: number;
}
type InputType = Record<string, any>;
type OutputType = Record<string, any>;
type MetadataType = Record<string, any>;
interface DatasetItemValue {
    input: InputType;
    output: OutputType;
    metadata: MetadataType;
}
type DatasetItem = DatasetItemValue & {
    id: string;
};
interface Dataset {
    id: string;
    name: string;
    description?: string;
}
type DatasetWithItems = Dataset & {
    items: DatasetItem[];
};
declare class Experiments {
    private client;
    private items;
    constructor(client: Hamming);
    run(opts: RunOptions, run: Runner): Promise<{
        experimentUrl: string;
    }>;
    private start;
    private end;
    private generateName;
}
type DatasetId = string;
interface RunOptions {
    dataset: DatasetId;
    name?: string;
    scoring?: ScoreType[];
    metadata?: MetadataType;
    parallel?: boolean | number;
}
type RunContext = {
    tracing: TracingContext;
};
type Runner = (input: InputType) => Promise<OutputType>;
declare enum ScoreType {
    AccuracyAI = "accuracy_ai",
    FactsCompare = "facts_compare",
    ContextRecall = "context_recall",
    ContextPrecision = "context_precision",
    Hallucination = "hallucination",
    StringDiff = "string_diff",
    Refusal = "refusal",
    SqlAst = "sql_ast"
}
declare const DefaultScoreTypes: ScoreType[];
declare class Datasets {
    private client;
    constructor(client: Hamming);
    load(id: DatasetId): Promise<DatasetWithItems>;
    list(): Promise<Dataset[]>;
    create(opts: CreateDatasetOptions): Promise<DatasetWithItems>;
}
interface CreateDatasetOptions {
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
interface RetrievalParams {
    query?: string;
    results?: Document[] | string[];
    metadata?: {
        engine?: string;
    };
}
interface ITracing {
    logGeneration(params: GenerationParams): void;
    logRetrieval(params: RetrievalParams): void;
    log(key: string, value: unknown): void;
    log(trace: TraceEvent): void;
}
declare class Tracing implements ITracing {
    private client;
    private collected;
    private currentLocalTraceId;
    constructor(client: Hamming);
    private nextTraceId;
    _flush(experimentItemId: string): Promise<void>;
    private _generationEvent;
    private _retrievalEvent;
    log(key: string, value: unknown): void;
    log(trace: TraceEvent): void;
    logGeneration(params: GenerationParams): void;
    logRetrieval(params: RetrievalParams): void;
}
interface TracingContext {
    experiment?: {
        itemId?: string;
    };
}
interface ClientOptions {
    apiKey: string;
    baseURL?: string;
}
declare class Hamming extends HttpClient {
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
    tracing: Tracing;
}

export { type ClientOptions, type CreateDatasetOptions, type DatasetId, type DatasetItemValue, DefaultScoreTypes, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, Hamming, type InputType, type MetadataType, type OutputType, type RunContext, type Runner, ScoreType };
