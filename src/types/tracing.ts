import { ExperimentContext } from "./experiments";
import { MonitoringTraceContext } from "./monitoring";
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

export type Context = ExperimentContext | MonitoringTraceContext;

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

export interface RetrievalParams {
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
