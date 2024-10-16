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

export type RunContext = {
  tracing: TracingContext;
};

export type Runner = (input: InputType) => Promise<OutputType>;

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  bedrock?: {
    awsAccessKey?: string;
    awsSecretKey?: string;
    awsRegion?: string;
    awsSessionToken?: string;
  };
}

export interface CreateDatasetOptions {
  name: string;
  description?: string;
  items: DatasetItemValue[];
}

export type TraceEvent = Record<string, unknown>;

export type LLMProvider = "openai" | "anthropic" | "azure_openai";

export interface GenerationMetadata {
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
}

export interface GenerationParams {
  input?: string;
  output?: string;
  metadata?: GenerationMetadata;
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
    [key: string]: unknown;
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
  end(error?: boolean, errorMessage?: string): void;
  tracing: ITracing;
}

export enum MonitoringItemType {
  CALL = "CALL",
  TEXT = "TEXT",
}

export enum MonitoringItemStatus {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum SessionEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
}

export interface MonitoringStartOpts {
  environment?: SessionEnvironment;
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

export interface Score {
  value: number;
  reason?: string;
}

export enum FunctionType {
  Numeric = "numeric",
  Classification = "classification",
}

export type NumericScoreConfig = {
  type: FunctionType.Numeric;
  aggregate: "mean" | "median";
};

export type ClassificationScoreConfig = {
  type: FunctionType.Classification;
  labels: Record<number, string>;
  colors?: Record<number, LabelColor>;
};

export type ScoreConfig = ClassificationScoreConfig | NumericScoreConfig;

export enum ScorerExecutionType {
  Local = "local",
  Remote = "remote",
}

type Scorer = LocalScorer | LLMClassifyScorer;

export interface LocalScorer {
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

interface PromptConfig {
  slug: string;
  label?: string;
}

export enum ScoreParserType {
  XML = "xml",
  JSON = "json",
}

interface ScoreParserConfig {
  type: ScoreParserType;
}

export interface LLMClassifyScorer extends RemoteScorer {
  method: "classify";
  prompt: PromptConfig;
  variableMappings?: Record<string, string>;
  scoreParser: ScoreParserConfig;
}

export interface ScoringFunction {
  name: string;
  version: number;
  scoreConfig?: ScoreConfig;
  scorer: Scorer;
}

export interface CustomScoringConfig {
  id: string;
  key_name: string;
}

export const ScoringErrorValue = -1;

export const ScoringErrorPrefix = "<!--hamming_scoring_error-->";

export enum LabelColor {
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
  Red = "red",
}

export interface Prompt {
  slug: string;
}

export interface ToolChoice {
  choice: string;
  functionName: string;
}

export interface PromptSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  toolChoice?: ToolChoice;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface PromptContent {
  languageModel: string;
  promptSettings: PromptSettings;
  chatMessages: ChatMessage[];
  tools?: string;
}

export interface PromptWithContent extends Prompt {
  content?: PromptContent;
}

export enum EventKind {
  Root = "root",
  Call = "call",
  CallEvent = "call_event",
}

export enum CallProvider {
  Custom = "custom",
  Retell = "retell",
  Vapi = "vapi",
}

export enum RetellCallEventType {
  Started = "call_started",
  Ended = "call_ended",
  Analyzed = "call_analyzed",
}

export interface RetellCallEvent {
  event: RetellCallEventType;
  call: Record<string, unknown>;
}

export enum VapiCallEventType {
  StatusUpdate = "status-update",
  EndOfCallReport = "end-of-call-report",
}

export interface VapiCallEvent {
  message: {
    type: VapiCallEventType;
  } & Record<string, unknown>;
}

export type CustomCallEvent = Record<string, unknown>;

export type CallEvent = CustomCallEvent | RetellCallEvent | VapiCallEvent;
