export enum TracingMode {
  OFF = "off",
  MONITORING = "monitoring",
  EXPERIMENT = "experiment",
}

export type TraceEvent = Record<string, unknown>;

export interface Trace {
  id: number;
  experimentItemId: string;
  parentId?: number;
  event: TraceEvent;
}

export interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

export interface RetrievalEventParams {
  query?: string;
  results?: Document[] | string[];
  metadata?: {
    engine?: string;
  };
}

export interface GenerationParams {
  input?: string;
  output?: string;
  metadata?: {
    model?: string;
  };
}
