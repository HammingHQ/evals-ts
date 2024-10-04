import { LRUCache } from "lru-cache";

import type {
  CallEvent,
  Hamming,
  MonitoringStartOpts,
  RunContext,
  TraceEvent,
} from "../index";

import {
  CallProvider,
  EventKind,
  MonitoringItemType,
  RetellCallEvent,
  RetellCallEventType,
} from "../types";

import { asyncRunContext } from "../asyncStorage";
import {
  MonitoringItem as IMonitoringItem,
  ITracing,
  InputType,
  MetadataType,
  MonitoringItemStatus,
  MonitoringSession,
  MonitoringTrace,
  MonitoringTraceContext,
  OutputType,
  TracingMode,
} from "../types";
import { parseRetellCallId } from "../utils/voice";
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
  itemType: MonitoringItemType;
  tracing: ITracing;

  constructor(
    client: Hamming,
    sessionId: string,
    seqId: number,
    itemType: MonitoringItemType,
  ) {
    this.itemType = itemType;
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
        kind:
          this.itemType === MonitoringItemType.CALL
            ? EventKind.Call
            : EventKind.Root,
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
  private callEvents: LRUCache<string, IMonitoringItem>;

  constructor(client: Hamming) {
    this.client = client;
  }

  start(opts?: MonitoringStartOpts) {
    // Delay creating session until the first async call of runItem
    this.monitoringStartOpts = opts;
    this.client._logger.start();
    this.client.tracing._setMode(TracingMode.MONITORING);
    this.state = MonitoringState.STARTED;
    this.callEvents = new LRUCache<string, IMonitoringItem>({
      max: 1000,
      ttl: 1000 * 60 * 60 * 2, // 2 hours
    });
    console.log("Monitoring started!");
  }

  stop() {
    this.session = null;
    this.client.tracing._setMode(TracingMode.OFF);
    this.client._logger.stop();
    this.state = MonitoringState.STOPPED;
    this.callEvents.clear();
    console.log("Monitoring stopped!");
  }

  async runItem(
    callback: (item: IMonitoringItem) => unknown | Promise<unknown>,
  ): Promise<unknown> {
    await this._createSessionIfNotExist();
    const [sessionId, seqId] = this._nextSeqId();

    const item = new MonitoringItem(
      this.client,
      sessionId,
      seqId,
      MonitoringItemType.TEXT,
    );
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

  async _startItem(itemType: MonitoringItemType): Promise<IMonitoringItem> {
    await this._createSessionIfNotExist();
    const [sessionId, seqId] = this._nextSeqId();

    const item = new MonitoringItem(this.client, sessionId, seqId, itemType);
    item._start();
    return item;
  }

  async startItem(): Promise<IMonitoringItem> {
    return this._startItem(MonitoringItemType.TEXT);
  }

  async _startCall(): Promise<IMonitoringItem> {
    return this._startItem(MonitoringItemType.CALL);
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

  async callEvent(
    provider: CallProvider,
    event: CallEvent,
    metadata?: MetadataType,
  ) {
    switch (provider) {
      case CallProvider.Custom:
        throw Error("Custom call provider not implemented!");
      case CallProvider.Retell:
        await this.handleRetellCallEvent(event as RetellCallEvent, metadata);
        break;
      default:
        throw Error(`Unsupported call provider: ${provider}`);
    }
  }

  async handleRetellCallEvent(
    evt: RetellCallEvent,
    metadata: MetadataType = {},
  ) {
    const callId = parseRetellCallId(evt);
    if (!callId) {
      throw Error("call_id is missing");
    }
    let monitoringItem: IMonitoringItem | undefined;
    if (evt.event === RetellCallEventType.Started) {
      monitoringItem = await this._startCall();
      monitoringItem.tracing.log({
        kind: EventKind.CallEvent,
        event: evt,
      });
      this.callEvents.set(callId, monitoringItem);
    } else if (evt.event === RetellCallEventType.Ended) {
      monitoringItem = this.callEvents.get(callId);
      if (!monitoringItem) {
        console.warn(`Missing call_started event for id: ${callId}`);
        monitoringItem = await this._startCall();
        this.callEvents.set(callId, monitoringItem);
      }
      monitoringItem.tracing.log({
        kind: EventKind.CallEvent,
        event: evt,
      });
      monitoringItem.setInput({
        provider: CallProvider.Retell,
      });
      monitoringItem.setMetadata(metadata);
      monitoringItem.setOutput(evt.call);
      monitoringItem.end();
    } else if (evt.event === RetellCallEventType.Analyzed) {
      monitoringItem = this.callEvents.get(callId);
      if (!monitoringItem) {
        console.warn(`Missing call_started event for id: ${callId}`);
        monitoringItem = await this._startCall();
        monitoringItem.tracing.log({
          kind: EventKind.CallEvent,
          event: evt,
        });
        monitoringItem.end();
      } else {
        monitoringItem.tracing.log({
          kind: EventKind.CallEvent,
          event: evt,
        });
      }
    }
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
