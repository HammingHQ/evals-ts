import type { TraceEvent } from "./tracing";

export enum MonitoringItemStatus {
  STARTED = "STARTED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface MonitoringSession {
  id: string;
  seq_id: number;
}

export interface MonitoringTraceContext {
  sessionId: string;
  seqId: number;
  parentSeqId?: number;
}

export interface MonitoringTrace extends MonitoringTraceContext {
  event: TraceEvent;
}
