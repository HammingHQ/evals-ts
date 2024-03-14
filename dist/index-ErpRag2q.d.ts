import { DatasetId, Dataset, CreateDatasetOptions, DatasetItem } from './types/datasets.js';
import { Runner } from './types/experiments.js';
import { ScoreType, MetadataType, InputType, OutputType } from './types/types.js';
import { HttpClient } from './resources/HttpClient.js';
import { MonitoringItemStatus, MonitoringTrace, MonitoringTraceContext } from './types/monitoring.js';
import { TracingMode, TraceEvent, GenerationParams, RetrievalEventParams } from './types/tracing.js';
import { LogMessage } from './types/asyncLogger.js';

declare class AsyncLogger {
    private client;
    private queue;
    private stopEvent;
    private queueNotEmptyEvent;
    constructor(client: Hamming);
    log(message: LogMessage): void;
    start(): Promise<void>;
    stop(): void;
    private _drain_queue;
    private _process_queue;
    private _publish;
}

type DatasetWithItems = Dataset & {
    items: DatasetItem[];
};
declare class Datasets {
    private client;
    constructor(client: Hamming);
    load(id: DatasetId): Promise<DatasetWithItems>;
    list(): Promise<Dataset[]>;
    create(opts: CreateDatasetOptions): Promise<DatasetWithItems>;
}

interface RunOptions {
    dataset: DatasetId;
    name?: string;
    scoring?: ScoreType[];
    metadata?: MetadataType;
    parallel?: boolean | number;
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

declare class MonitoringItem {
    monitoring: Monitoring;
    sessionId: string;
    seqId: number;
    input: InputType | undefined;
    output: OutputType | undefined;
    metadata: MetadataType | undefined;
    metrics: Record<string, any>;
    status: MonitoringItemStatus;
    errorMessage: string | undefined;
    startTs: number;
    constructor(monitoring: Monitoring, session_id: string, seq_id: number);
    setInput(input: InputType): void;
    setOutput(output: OutputType): void;
    setMetadata(metadata: MetadataType): void;
    _start(input?: InputType, metadata?: MetadataType): void;
    _end(error?: boolean, errorMessage?: string): void;
    _hasEnded(): boolean;
    _toTrace(): MonitoringTrace;
}
declare class Monitoring {
    private client;
    private session;
    private currentItem;
    constructor(client: Hamming);
    start(): void;
    stop(): void;
    startItem(input?: InputType, metadata?: MetadataType): MonitoringItem;
    _endItem(trace: MonitoringTrace): void;
    _getTraceContext(): MonitoringTraceContext;
    private _nextSeqId;
}

declare class Tracing {
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
    logRetrieval(params: RetrievalEventParams): void;
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
    monitoring: Monitoring;
    logger: AsyncLogger;
}

export { AsyncLogger as A, type ClientOptions as C, Datasets as D, Experiments as E, Hamming as H, MonitoringItem as M, Tracing as T, Monitoring as a };
