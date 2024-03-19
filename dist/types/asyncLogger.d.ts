import { MonitoringTrace } from './monitoring.js';
import './tracing.js';

declare enum LogMessageType {
    MONITORING = 1
}
interface LogMessage {
    type: LogMessageType;
    payload?: MonitoringTrace;
}

export { type LogMessage, LogMessageType };
