import { TraceEvent } from './tracing.js';

declare enum MonitoringItemStatus {
    STARTED = "STARTED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
interface MonitoringSession {
    id: string;
    seq_id: number;
}
interface MonitoringTraceContext {
    sessionId: string;
    seqId: number;
    parentSeqId?: number;
}
interface MonitoringTrace extends MonitoringTraceContext {
    event: TraceEvent;
}

export { MonitoringItemStatus, type MonitoringSession, type MonitoringTrace, type MonitoringTraceContext };
