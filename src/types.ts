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
}

interface TracingContext {
  experiment?: {
    itemId?: string;
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

export interface GenerationParams {
  input?: string;
  output?: string;
  metadata?: {
    model?: string;
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
