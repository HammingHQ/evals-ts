import type {
  Hamming,
  MonitoringStartOpts,
  RunContext,
  TraceEvent,
} from "../index";

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

enum MonitoringState {
  STARTED,
  STOPPED,
}

const INVALID_SESSION_ID = "INVALID_SESSION";

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
    if (!trace) return;
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
  private state: MonitoringState = MonitoringState.STOPPED;
  private session: MonitoringSession | null;
  private monitoringStartOpts: MonitoringStartOpts | undefined;

  constructor(client: Hamming) {
    this.client = client;
  }

  start(opts?: MonitoringStartOpts) {
    // Delay creating session until the first async call of runItem
    this.monitoringStartOpts = opts;
    this.client._logger.start();
    this.client.tracing._setMode(TracingMode.MONITORING);
    this.state = MonitoringState.STARTED;
    console.log("Monitoring started!");
  }

  stop() {
    this.session = null;
    this.client.tracing._setMode(TracingMode.OFF);
    this.client._logger.stop();
    this.state = MonitoringState.STOPPED;
    console.log("Monitoring stopped!");
  }

  async runItem(
    callback: (item: IMonitoringItem) => unknown | Promise<unknown>,
  ): Promise<unknown> {
    await this._createSessionIfNotExist();
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

  async startItem(): Promise<IMonitoringItem> {
    await this._createSessionIfNotExist();
    const [sessionId, seqId] = this._nextSeqId();

    const item = new MonitoringItem(this.client, sessionId, seqId);
    item._start();
    return item;
  }

  _endItem(trace: MonitoringTrace) {
    if (this.state === MonitoringState.STOPPED) {
      return;
    }
    this.client.tracing._logLiveTrace(trace);
  }

  _getTraceContext(ctx?: RunContext): MonitoringTraceContext | null {
    if (this.state === MonitoringState.STOPPED) {
      return null;
    }
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
    if (this.state === MonitoringState.STOPPED) {
      return [INVALID_SESSION_ID, 0];
    }
    if (!this.session) {
      throw Error("Monitoring not started");
    }
    this.session.seqId += 1;
    return [this.session.id, this.session.seqId];
  }

  private async _createSessionIfNotExist() {
    if (this.state === MonitoringState.STOPPED) {
      return;
    }
    if (this.session) return;
    const environment =
      this.monitoringStartOpts?.environment ?? process.env.NODE_ENV;
    const resp = await this.client.fetch("/sessions", {
      method: "POST",
      body: JSON.stringify({
        metadata: environment ? { environment } : {},
      }),
    });
    const data = await resp.json();
    this.session = {
      id: data.id,
      seqId: 0,
    };
  }
}
