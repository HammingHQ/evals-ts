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
type InputType = Record<string, any>;
type OutputType = Record<string, any>;
type MetadataType = Record<string, any>;
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
type DatasetId = string;
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
interface RunOptions {
    dataset: DatasetId;
    name?: string;
    scoring?: ScoreType[];
    metadata?: MetadataType;
    parallel?: boolean | number;
}
interface TracingContext {
    experiment?: {
        itemId?: string;
    };
    monitoring?: {
        seqId?: number;
    };
}
type RunContext = {
    tracing: TracingContext;
};
type Runner = (input: InputType) => Promise<OutputType>;
interface ClientOptions {
    apiKey: string;
    baseURL?: string;
}
interface CreateDatasetOptions {
    name: string;
    description?: string;
    items: DatasetItemValue[];
}
type TraceEvent = Record<string, unknown>;
type LLMProvider = "openai" | "anthropic" | "azure_openai";
interface GenerationParams {
    input?: string;
    output?: string;
    metadata?: {
        provider?: LLMProvider;
        model?: string;
        stream?: boolean;
        max_tokens?: number;
        n?: number;
        seed?: number;
        temperature?: number;
        usage?: {
            completion_tokens?: number;
            prompt_tokens?: number;
            total_tokens?: number;
        };
        duration_ms?: number;
        error?: boolean;
        error_message?: string;
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
interface Trace {
    id: number;
    experimentItemId: string;
    parentId?: number;
    event: TraceEvent;
}
declare enum TracingMode {
    OFF = "off",
    MONITORING = "monitoring",
    EXPERIMENT = "experiment"
}
interface ITracing {
    logGeneration(params: GenerationParams): void;
    logRetrieval(params: RetrievalParams): void;
    log(key: string, value: unknown): void;
    log(trace: TraceEvent): void;
}
interface MonitoringItem {
    setInput(input: InputType): void;
    setOutput(output: OutputType): void;
    setMetadata(metadata: MetadataType): void;
}
declare enum MonitoringItemStatus {
    STARTED = "STARTED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
interface MonitoringSession {
    id: string;
    seqId: number;
}
interface MonitoringTraceContext {
    session_id: string;
    seq_id: number;
    parent_seq_id: number | null;
}
interface MonitoringTrace extends MonitoringTraceContext {
    event: TraceEvent;
}
declare enum LogMessageType {
    MONITORING = 1
}
interface LogMessage {
    type: LogMessageType;
    payload?: MonitoringTrace;
}

export { type ClientOptions, type CreateDatasetOptions, type Dataset, type DatasetId, type DatasetItem, type DatasetItemValue, type DatasetWithItems, type Document, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, type GenerationParams, type ITracing, type InputType, type LLMProvider, type LogMessage, LogMessageType, type MetadataType, type MonitoringItem, MonitoringItemStatus, type MonitoringSession, type MonitoringTrace, type MonitoringTraceContext, type OutputType, type RetrievalParams, type RunContext, type RunOptions, type Runner, ScoreType, type Trace, type TraceEvent, TracingMode };
