import { DatasetId, DatasetWithItems, Dataset, CreateDatasetOptions, RunOptions, Runner, TraceEvent, GenerationParams, RetrievalParams, ClientOptions } from './types.js';
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

declare class Hamming extends HttpClient {
    constructor(config: ClientOptions);
    experiments: Experiments;
    datasets: Datasets;
    tracing: Tracing;
}

export { Datasets as D, Experiments as E, Hamming as H, Tracing as T };
