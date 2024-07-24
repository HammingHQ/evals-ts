import { Anthropic } from '@anthropic-ai/sdk';
import { Message, RawMessageStreamEvent } from '@anthropic-ai/sdk/resources/messages.mjs';
import { Stream } from '@anthropic-ai/sdk/streaming.mjs';
import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources/chat/completions';
import { Stream as Stream$1 } from 'openai/streaming.mjs';

type RequestDelayFunction = (attempt: number, error: Error | null, response: Response | null, input?: string | Request) => number;
type RequestRetryOnFunction = (attempt: number, error: Error | null, response: Response | null) => boolean | Promise<boolean>;
interface RequestInitRetryParams {
    retries?: number;
    retryDelay?: number | RequestDelayFunction;
    retryOn?: number[] | RequestRetryOnFunction;
}
type RequestInitWithRetry = RequestInit & RequestInitRetryParams;
declare class FetchClient {
    private retries;
    private retryDelay;
    private retryOn;
    constructor(defaults?: RequestInitRetryParams);
    private validateDefaults;
    private isPositiveInteger;
    fetchRetry(input: RequestInfo, init?: RequestInitWithRetry): Promise<Response>;
}

interface HttpClientOptions {
    apiKey: string;
    baseURL: string;
}
/**
 * The HttpClient provides methods to perform HTTP requests.
 * The `fetch` method is used to make a request to a specified endpoint.
 * It includes retry logic for transient errors, where it will retry the request
 * according to the `maxRetries` and `retryDelay` parameters.
 * For non-transient errors, it will fail fast and not retry the request.
 * @param input - The endpoint to which the request will be made.
 * @param init - The request options.
 * @param maxRetries - The maximum number of retries for the request.
 * @param retryDelay - The delay between retries.
 * @returns A promise that resolves to the response of the request, or rejects
 *          with an error if the request fails or all retries are exhausted.
 */
declare class HttpClient {
    apiKey: string;
    baseURL: string;
    fetchClient: FetchClient;
    debug: boolean;
    retries: number;
    constructor(opts: HttpClientOptions);
    /**
     * Sanitizes the base URL by trimming whitespace and removing trailing slashes.
     * @param baseURL - The base URL to sanitize.
     * @returns The sanitized base URL.
     */
    private sanitizeBaseUrl;
    fetch(input: string, init?: RequestInit | undefined): Promise<Response>;
}

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
    openaiApiKey?: string;
    anthropicApiKey?: string;
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
        [key: string]: unknown;
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
    tools?: string;
}
interface PromptWithContent extends Prompt {
    content?: PromptContent;
}

declare class Logger {
    private client;
    private queue;
    private stopped;
    private queueHasMessages;
    constructor(client: Hamming);
    log(message: LogMessage): void;
    start(): Promise<void>;
    stop(): void;
    private _drainQueue;
    private _processQueue;
    private _publish;
}

declare class AnthropicClient {
    private readonly client;
    private anthropic?;
    constructor(client: Hamming);
    load(): Promise<Anthropic>;
    createMessage(prompt: PromptWithContent, variables?: Record<string, string>): Promise<Message>;
    createMessageStream(prompt: PromptWithContent, variables?: Record<string, string>): Promise<Stream<RawMessageStreamEvent>>;
}

declare class Datasets {
    private client;
    constructor(client: Hamming);
    load(id: DatasetId): Promise<DatasetWithItems>;
    list(): Promise<Dataset[]>;
    create(opts: CreateDatasetOptions): Promise<DatasetWithItems>;
}

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

declare class Monitoring {
    client: Hamming;
    private state;
    private session;
    private monitoringStartOpts;
    constructor(client: Hamming);
    start(opts?: MonitoringStartOpts): void;
    stop(): void;
    runItem(callback: (item: MonitoringItem) => unknown | Promise<unknown>): Promise<unknown>;
    startItem(): Promise<MonitoringItem>;
    _endItem(trace: MonitoringTrace): void;
    _getTraceContext(ctx?: RunContext): MonitoringTraceContext | null;
    private _nextSeqId;
    private _createSessionIfNotExist;
}

declare class OpenAIClient {
    private readonly client;
    private openai?;
    constructor(client: Hamming);
    load(): Promise<OpenAI>;
    createChatCompletion(prompt: PromptWithContent, variables?: Record<string, string>): Promise<ChatCompletion>;
    createChatCompletionStream(prompt: PromptWithContent, variables?: Record<string, string>): Promise<Stream$1<ChatCompletionChunk>>;
}

declare class Prompts {
    private readonly client;
    constructor(client: Hamming);
    list(label?: string): Promise<Prompt[]>;
    get(slug: string, label?: string, version?: string): Promise<PromptWithContent>;
}

declare abstract class TracerBase implements ITracing {
    abstract logEvent(event: TraceEvent): void;
    private _generationEvent;
    private _retrievalEvent;
    log(key: string, value: unknown): void;
    log(trace: TraceEvent): void;
    logGeneration(params: GenerationParams): void;
    logRetrieval(params: RetrievalParams): void;
}
declare class Tracing extends TracerBase implements ITracing {
    private client;
    private collected;
    private currentLocalTraceId;
    private mode;
    constructor(client: Hamming);
    _setMode(mode: TracingMode): void;
    private nextTraceId;
    _flush(experimentItemId: string): Promise<void>;
    _logLiveTrace(trace: MonitoringTrace): void;
    logEvent(event: TraceEvent): void;
}

declare class Hamming extends HttpClient {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
    tracing: Tracing;
    monitoring: Monitoring;
    prompts: Prompts;
    openai: OpenAIClient;
    anthropic: AnthropicClient;
    _logger: Logger;
}

declare class PromptTemplate {
    readonly prompt: PromptContent;
    readonly vars: Array<string>;
    constructor(prompt: PromptContent);
    private extractVariables;
    compile(values: Record<string, string>): PromptContent;
}

export { type ChatMessage, type ClassificationScoreConfig, type ClientOptions, type CreateDatasetOptions, type CustomScoringConfig, type Dataset, type DatasetId, type DatasetItem, type DatasetItemValue, type DatasetWithItems, type Document, type Experiment, type ExperimentItem, type ExperimentItemContext, type ExperimentItemMetrics, ExperimentStatus, FunctionType, type GenerationParams, Hamming, type ITracing, type InputType, type LLMClassifyScorer, type LLMProvider, LabelColor, type LocalScorer, type LogMessage, LogMessageType, type MetadataType, type MonitoringItem, MonitoringItemStatus, type MonitoringSession, type MonitoringStartOpts, type MonitoringTrace, type MonitoringTraceContext, type NumericScoreConfig, type OutputType, type Prompt, type PromptContent, type PromptSettings, PromptTemplate, type PromptWithContent, type RetrievalParams, type RunContext, type RunOptions, type Runner, type Score, type ScoreConfig, ScoreType, ScorerExecutionType, ScoringErrorPrefix, ScoringErrorValue, type ScoringFunction, SessionEnvironment, type ToolChoice, type Trace, type TraceEvent, TracingMode };
