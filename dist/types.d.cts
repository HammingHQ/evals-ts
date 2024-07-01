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
    scoring?: (ScoreType | ScoringFunction)[];
    metadata?: MetadataType;
    parallel?: boolean | number;
    sampling?: number;
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
        [key: string]: any;
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
    end(error?: boolean, errorMessage?: string): void;
    tracing: ITracing;
}
declare enum MonitoringItemStatus {
    STARTED = "STARTED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
declare enum SessionEnvironment {
    DEVELOPMENT = "development",
    STAGING = "staging",
    PRODUCTION = "production"
}
interface MonitoringStartOpts {
    environment?: SessionEnvironment;
}
interface MonitoringSession {
    id: string;
    seqId: number;
}
interface MonitoringTraceContext {
    session_id: string;
    seq_id: number;
    parent_seq_id?: number;
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
interface Score {
    value: number;
    reason?: string;
}
declare enum FunctionType {
    Numeric = "numeric",
    Classification = "classification"
}
type NumericScoreConfig = {
    type: FunctionType.Numeric;
    aggregate: "mean" | "median";
};
type ClassificationScoreConfig = {
    type: FunctionType.Classification;
    labels: Record<number, string>;
    colors?: Record<number, LabelColor>;
};
type ScoreConfig = ClassificationScoreConfig | NumericScoreConfig;
declare enum ScorerExecutionType {
    Local = "local",
    Remote = "remote"
}
type Scorer = LocalScorer | LLMClassifyScorer;
interface LocalScorer {
    type: ScorerExecutionType.Local;
    scoreFn: (args: {
        input: InputType;
        output: OutputType;
        expected: OutputType;
    }) => Promise<Score>;
}
interface RemoteScorer {
    type: ScorerExecutionType.Remote;
}
interface OpenAIModelConfig {
    model: string;
    temperature?: number;
    seed?: number;
    maxTokens?: number;
}
interface LLMClassifyScorer extends RemoteScorer {
    provider: LLMProvider;
    config: OpenAIModelConfig;
    promptTemplate: string;
}
interface ScoringFunction {
    name: string;
    version: number;
    scoreConfig?: ScoreConfig;
    scorer: Scorer;
}
interface CustomScoringConfig {
    id: string;
    key_name: string;
}
declare const ScoringErrorValue = -1;
declare const ScoringErrorPrefix = "<!--hamming_scoring_error-->";
declare enum LabelColor {
    Gray = "gray",
    LightGreen = "light-green",
    LightBlue = "light-blue",
    Amber = "amber",
    Purple = "purple",
    Pink = "pink",
    Green = "green",
    PastelGreen = "pastel-green",
    Yellow = "yellow",
    Blue = "blue",
    Red = "red"
}
interface Prompt {
    slug: string;
}
interface ToolChoice {
    choice: string;
    functionName: string;
}
interface PromptSettings {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    toolChoice?: ToolChoice;
}
interface ChatMessage {
    role: string;
    content: string;
}
interface PromptContent {
    languageModel: string;
    promptSettings: PromptSettings;
    chatMessages: ChatMessage[];
    tools?: Record<string, string>;
}

export { type ChatMessage, type ClassificationScoreConfig, type ClientOptions, type CreateDatasetOptions, type CustomScoringConfig, type Dataset, type DatasetId, type DatasetItem, type DatasetItemValue, type DatasetWithItems, type Document, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, FunctionType, type GenerationParams, type ITracing, type InputType, type LLMClassifyScorer, type LLMProvider, LabelColor, type LocalScorer, type LogMessage, LogMessageType, type MetadataType, type MonitoringItem, MonitoringItemStatus, type MonitoringSession, type MonitoringStartOpts, type MonitoringTrace, type MonitoringTraceContext, type NumericScoreConfig, type OutputType, type Prompt, type PromptContent, type PromptSettings, type RetrievalParams, type RunContext, type RunOptions, type Runner, type Score, type ScoreConfig, ScoreType, ScorerExecutionType, ScoringErrorPrefix, ScoringErrorValue, type ScoringFunction, SessionEnvironment, type ToolChoice, type Trace, type TraceEvent, TracingMode };
