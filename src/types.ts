export enum ScoreType {
  AccuracyAI = "accuracy_ai",
  FactsCompare = "facts_compare",
  ContextRecall = "context_recall",
  ContextPrecision = "context_precision",
  Hallucination = "hallucination",
  StringDiff = "string_diff",
  Refusal = "refusal",
  SqlAst = "sql_ast",
}

export type InputType = Record<string, any>;
export type OutputType = Record<string, any>;
export type MetadataType = Record<string, any>;

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

export type DatasetId = string;

export interface DatasetItemValue {
  input: InputType;
  output: OutputType;
  metadata: MetadataType;
}

export type DatasetItem = DatasetItemValue & { id: string };

export interface Dataset {
  id: string;
  name: string;
  description?: string;
}

export type DatasetWithItems = Dataset & { items: DatasetItem[] };

export interface RunOptions {
  dataset: DatasetId;
  name?: string;
  scoring?: ScoreType[];
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

export type RunContext = {
  tracing: TracingContext;
};

export type Runner = (input: InputType) => Promise<OutputType>;

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
}

export interface CreateDatasetOptions {
  name: string;
  description?: string;
  items: DatasetItemValue[];
}

export type TraceEvent = Record<string, unknown>;

export type LLMProvider = "openai" | "anthropic" | "azure_openai";

export interface GenerationParams {
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

export interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

export interface RetrievalParams {
  query?: string;
  results?: Document[] | string[];
  metadata?: {
    engine?: string;
  };
}

export interface Trace {
  id: number;
  experimentItemId: string;
  parentId?: number;
  event: TraceEvent;
}

export enum TracingMode {
  OFF = "off",
  MONITORING = "monitoring",
  EXPERIMENT = "experiment",
}

export interface ITracing {
  logGeneration(params: GenerationParams): void;
  logRetrieval(params: RetrievalParams): void;
  log(key: string, value: unknown): void;
  log(trace: TraceEvent): void;
}

export interface MonitoringItem {
  setInput(input: InputType): void;
  setOutput(output: OutputType): void;
  setMetadata(metadata: MetadataType): void;
}

export enum MonitoringItemStatus {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface MonitoringSession {
  id: string;
  seqId: number;
}

export interface MonitoringTraceContext {
  session_id: string;
  seq_id: number;
  parent_seq_id?: number;
}

export interface MonitoringTrace extends MonitoringTraceContext {
  event: TraceEvent;
}

export enum LogMessageType {
  MONITORING = 1,
}

export interface LogMessage {
  type: LogMessageType;
  payload?: MonitoringTrace;
}
