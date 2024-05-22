import { randomUUID } from "crypto";

import type { Hamming, RunContext, TraceEvent } from "../index";

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
import { TracerBase } from "./tracing";

function newRunContext(seqId: number): RunContext {
  return {
    tracing: {
      monitoring: {
        seqId,
      },
    },
  };
}

class MonitoringItemTracing extends TracerBase implements ITracing {
  client: Hamming;
  runCtx: RunContext;

  constructor(client: Hamming, seqId: number) {
    super();
    this.client = client;
    this.runCtx = newRunContext(seqId);
  }

  logEvent(event: TraceEvent) {
    const trace = this.client.monitoring._getTraceContext(this.runCtx);
    this.client.tracing._logLiveTrace({
      event,
      ...trace,
    });
  }
}

class MonitoringItem implements IMonitoringItem {
  client: Hamming;
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

  constructor(client: Hamming, sessionId: string, seqId: number) {
    this.client = client;
    this.sessionId = sessionId;
    this.seqId = seqId;
    this.metrics = {};
    this.tracing = new MonitoringItemTracing(client, seqId);
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

  end(error: boolean = false, errorMessage?: string) {
    this._end(error, errorMessage);
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
    this.client.monitoring._endItem(this._toTrace());
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

    const item = new MonitoringItem(this.client, sessionId, seqId);
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

    const item = new MonitoringItem(this.client, sessionId, seqId);
    item._start();
    return item;
  }

  _endItem(trace: MonitoringTrace) {
    this.client.tracing._logLiveTrace(trace);
  }

  _getTraceContext(ctx?: RunContext): MonitoringTraceContext {
    if (!this.session) throw Error("Monitoring not started");

    const [sessionId, seqId] = this._nextSeqId();
    const parentSeqId = ctx?.tracing?.monitoring?.seqId;

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
