import { randomUUID } from "crypto";

import type { Hamming, RunContext } from "../index";

import {
  MonitoringItem as IMonitoringItem,
  ITracing,
  InputType,
  MetadataType,
  MonitoringItemStatus,
  MonitoringSession,
  MonitoringTrace,
  OutputType,
  TracingMode,
  MonitoringTraceContext,
} from "../types";
import { asyncRunContext } from "../asyncStorage";

function newRunContext(seqId: number): RunContext {
  return {
    tracing: {
      monitoring: {
        seqId,
      },
    },
  };
}

class MonitoringItem implements IMonitoringItem {
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

  tracing: ITracing;

  constructor(monitoring: Monitoring, sessionId: string, seqId: number) {
    this.monitoring = monitoring;
    this.sessionId = sessionId;
    this.seqId = seqId;
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

  _start() {
    this.startTs = Date.now();
    this.status = MonitoringItemStatus.STARTED;
  }

  _end(error: boolean = false, errorMessage?: string) {
    if (this._hasEnded()) return;

    this.metrics.duration_ms = Date.now() - this.startTs;
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
      session_id: this.sessionId,
      seq_id: this.seqId,
      parent_seq_id: undefined,
      event: {
        kind: "root",
        input: this.input,
        output: this.output,
        metadata: this.metadata,
        metrics: this.metrics,
        status: this.status,
        error_message: this.errorMessage,
      },
    };
  }
}

export class Monitoring {
  client: Hamming;
  private session: MonitoringSession | null;

  constructor(client: Hamming) {
    this.client = client;
  }

  start() {
    console.log("Monitoring started!");
    if (!this.session) {
      this.session = {
        id: randomUUID(),
        seqId: 0,
      };
    }
    this.client._logger.start();
    this.client.tracing._setMode(TracingMode.MONITORING);
  }

  stop() {
    this.session = null;
    this.client.tracing._setMode(TracingMode.OFF);
    this.client._logger.stop();
  }

  async runItem(
    callback: (item: IMonitoringItem) => unknown | Promise<unknown>,
  ): Promise<unknown> {
    const [sessionId, seqId] = this._nextSeqId();

    const item = new MonitoringItem(this, sessionId, seqId);
    item._start();

    try {
      const response = await asyncRunContext.run(
        newRunContext(item.seqId),
        async () => await callback(item),
      );
      if (!item.output) {
        if (
          response &&
          response instanceof Object &&
          !Array.isArray(response)
        ) {
          item.setOutput(response);
        } else {
          item.setOutput({ response });
        }
      }
      item._end();

      return response;
    } catch (error) {
      item._end(true, error.message);
      throw error;
    }
  }

  startItem(): IMonitoringItem {
    const [sessionId, seqId] = this._nextSeqId();

    const item = new MonitoringItem(this, sessionId, seqId);
    item._start();
    return item;
  }

  endItem(item: IMonitoringItem, response?: OutputType) {
    if (item instanceof MonitoringItem) {
      if (!item.output) {
        if (
          response &&
          response instanceof Object &&
          !Array.isArray(response)
        ) {
          item.setOutput(response);
        } else {
          item.setOutput({ response });
        }
      }
      item._end();
    }
  }

  _endItem(trace: MonitoringTrace) {
    this.client.tracing._logLiveTrace(trace);
  }

  _getTraceContext(): MonitoringTraceContext {
    if (!this.session) throw Error("Monitoring not started");

    const [sessionId, seqId] = this._nextSeqId();
    const runCtx = asyncRunContext.getStore();
    const parentSeqId = runCtx?.tracing?.monitoring?.seqId;

    return {
      session_id: sessionId,
      seq_id: seqId,
      parent_seq_id: parentSeqId,
    };
  }

  private _nextSeqId(): [string, number] {
    if (!this.session) {
      throw Error("Monitoring not started");
    }
    this.session.seqId += 1;
    return [this.session.id, this.session.seqId];
  }
}
