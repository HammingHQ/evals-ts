import { randomUUID } from "crypto";

import type { Hamming } from "../index";
import {
  MonitoringItemStatus,
  MonitoringSession,
  MonitoringTrace,
  MonitoringTraceContext,
} from "../types/monitoring";
import { TracingMode } from "../types/tracing";
import { InputType, MetadataType, OutputType } from "../types/types";

export class MonitoringItem {
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

  constructor(monitoring: Monitoring, session_id: string, seq_id: number) {
    this.monitoring = monitoring;
    this.sessionId = session_id;
    this.seqId = seq_id;
    this.metrics = {};
  }

  setInput(input: InputType) {
    this.input = input;
  }

  setOutput(output: OutputType) {
    this.output = output;
  }

  setMetadata(metadata: MetadataType) {
    this.metadata = metadata;
  }

  _start(input?: InputType, metadata?: MetadataType) {
    this.input = input;
    this.metadata = metadata;
    this.startTs = Date.now();
    this.status = MonitoringItemStatus.STARTED;
  }

  _end(error: boolean = false, errorMessage?: string) {
    if (this._hasEnded()) return;

    this.metrics.durationMs = Date.now() - this.startTs;
    this.status = error
      ? MonitoringItemStatus.FAILED
      : MonitoringItemStatus.COMPLETED;
    this.errorMessage = errorMessage;
    this.monitoring._endItem(this._toTrace());
  }

  _hasEnded() {
    return [
      MonitoringItemStatus.COMPLETED,
      MonitoringItemStatus.FAILED,
    ].includes(this.status);
  }

  _toTrace(): MonitoringTrace {
    return {
      sessionId: this.sessionId,
      seqId: this.seqId,
      parentSeqId: undefined,
      event: {
        kind: "monitoring",
        input: this.input,
        output: this.output,
        metadata: this.metadata,
        metrics: this.metrics,
        status: this.status,
        errorMessage: this.errorMessage,
      },
    };
  }
}

export class Monitoring {
  private client: Hamming;
  private session: MonitoringSession | undefined;
  private currentItem: MonitoringItem | undefined;

  constructor(client: Hamming) {
    this.client = client;
  }

  start() {
    if (!this.session) {
      this.session = {
        id: randomUUID(),
        seq_id: 0,
      };
    }
    this.client.tracing._setMode(TracingMode.MONITORING);
  }

  stop() {
    this.session = undefined;
    this.client.tracing._setMode(TracingMode.OFF);
  }

  startItem(input?: InputType, metadata?: MetadataType) {
    const [sessionId, seqId] = this._nextSeqId();

    const item = new MonitoringItem(this, sessionId, seqId);
    item._start(input, metadata);
    this.currentItem = item;
    return item;
  }

  _endItem(trace: MonitoringTrace) {
    this.currentItem = undefined;
    this.client.tracing._logLiveTrace(trace);
  }

  _getTraceContext(): MonitoringTraceContext {
    if (!this.session) throw Error("Monitoring not started");

    const currentItem = this.currentItem;

    const [sessionId, seqId] = this._nextSeqId();

    return {
      sessionId,
      seqId,
      parentSeqId: currentItem?.seqId,
    };
  }

  private _nextSeqId(): [string, number] {
    if (!this.session) {
      throw Error("Monitoring not started");
    }
    this.session.seq_id += 1;
    return [this.session.id, this.session.seq_id];
  }
}
