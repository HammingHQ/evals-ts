declare enum TracingMode {
    OFF = "off",
    MONITORING = "monitoring",
    EXPERIMENT = "experiment"
}
type TraceEvent = Record<string, unknown>;
interface Trace {
    id: number;
    experimentItemId: string;
    parentId?: number;
    event: TraceEvent;
}
interface Document {
    pageContent: string;
    metadata: Record<string, any>;
}
interface RetrievalEventParams {
    query?: string;
    results?: Document[] | string[];
    metadata?: {
        engine?: string;
    };
}
interface GenerationParams {
    input?: string;
    output?: string;
    metadata?: {
        model?: string;
    };
}

export { type Document, type GenerationParams, type RetrievalEventParams, type Trace, type TraceEvent, TracingMode };
