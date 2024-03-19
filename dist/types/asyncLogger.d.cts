import { MonitoringTrace } from './monitoring.cjs';
import './tracing.cjs';

declare enum LogMessageType {
    MONITORING = 1
}
interface LogMessage {
    type: LogMessageType;
    payload?: MonitoringTrace;
}

export { type LogMessage, LogMessageType };
