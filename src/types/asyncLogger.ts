import type { MonitoringTrace } from "./monitoring";

export enum LogMessageType {
  MONITORING = 1,
}

export interface LogMessage {
  type: LogMessageType;
  payload?: MonitoringTrace;
}
