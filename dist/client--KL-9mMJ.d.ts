import { LogMessage, DatasetId, DatasetWithItems, Dataset, CreateDatasetOptions, RunOptions, Runner, MonitoringStartOpts, MonitoringItem, MonitoringTrace, RunContext, MonitoringTraceContext, ITracing, TraceEvent, GenerationParams, RetrievalParams, TracingMode, Prompt, PromptWithContent, ClientOptions } from './types.js';
import { HttpClient } from './httpClient.js';

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

declare class Prompts {
    private readonly client;
    constructor(client: Hamming);
    list(): Promise<Prompt[]>;
    get(slug: string, label?: string, version?: string): Promise<PromptWithContent>;
}

declare class Hamming extends HttpClient {
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
    tracing: Tracing;
    monitoring: Monitoring;
    prompts: Prompts;
    _logger: Logger;
}

export { Datasets as D, Experiments as E, Hamming as H, Logger as L, Monitoring as M, Prompts as P, TracerBase as T, Tracing as a };
