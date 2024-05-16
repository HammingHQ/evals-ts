import { DatasetId, DatasetWithItems, Dataset, CreateDatasetOptions, RunOptions, Runner, MonitoringItem, OutputType, MonitoringTrace, MonitoringTraceContext, ITracing, TracingMode, TraceEvent, GenerationParams, RetrievalParams, LogMessage, ClientOptions } from './types.js';
import { HttpClient } from './httpClient.js';

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
    private session;
    constructor(client: Hamming);
    start(): void;
    stop(): void;
    runItem(callback: (item: MonitoringItem) => unknown | Promise<unknown>): Promise<unknown>;
    startItem(): MonitoringItem;
    endItem(item: MonitoringItem, response?: OutputType): void;
    _endItem(trace: MonitoringTrace): void;
    _getTraceContext(): MonitoringTraceContext;
    private _nextSeqId;
}

declare class Tracing implements ITracing {
    private client;
    private collected;
    private currentLocalTraceId;
    private mode;
    constructor(client: Hamming);
    _setMode(mode: TracingMode): void;
    private nextTraceId;
    _flush(experimentItemId: string): Promise<void>;
    private _generationEvent;
    private _retrievalEvent;
    _logLiveTrace(trace: MonitoringTrace): void;
    log(key: string, value: unknown): void;
    log(trace: TraceEvent): void;
    logGeneration(params: GenerationParams): void;
    logRetrieval(params: RetrievalParams): void;
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

declare class Hamming extends HttpClient {
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
    tracing: Tracing;
    monitoring: Monitoring;
    _logger: Logger;
}

export { Datasets as D, Experiments as E, Hamming as H, Logger as L, Monitoring as M, Tracing as T };
