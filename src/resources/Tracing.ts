import type { Hamming } from "../index";
import { LogMessageType } from "../types/asyncLogger";
import { MonitoringTrace } from "../types/monitoring";
import {
  Document,
  GenerationParams,
  RetrievalEventParams,
  Trace,
  TraceEvent,
  TracingMode,
} from "../types/tracing";

export class Tracing {
  private client: Hamming;
  private collected: TraceEvent[] = [];
  private currentLocalTraceId: number = 0;

  private mode: TracingMode = TracingMode.OFF;

  constructor(client: Hamming) {
    this.client = client;
  }

  _setMode(mode: TracingMode) {
    this.mode = mode;
  }

  private nextTraceId(): number {
    return this.currentLocalTraceId++;
  }

  async _flush(experimentItemId: string) {
    if (this.mode !== TracingMode.EXPERIMENT) {
      console.warn(`Tracing mode must be set to <experiment>!`);
      return;
    }

    const events = this.collected;
    this.collected = [];

    const rootTrace: Trace = {
      id: this.nextTraceId(),
      experimentItemId,
      event: { kind: "root" },
    };

    const traces: Trace[] = [rootTrace];
    for (const event of events) {
      traces.push({
        id: this.nextTraceId(),
        experimentItemId,
        parentId: rootTrace.id,
        event,
      });
    }

    await this.client.fetch(`/traces`, {
      method: "POST",
      body: JSON.stringify({
        traces,
      }),
    });
  }

  private _generationEvent(params: GenerationParams): TraceEvent {
    return {
      kind: "llm",
      ...params,
    };
  }

  private _retrievalEvent(params: RetrievalEventParams): TraceEvent {
    const isString = (item: any) => typeof item === "string";
    const hasStringResults = params.results?.every(isString);
    const normalizeResult = (result: string | Document): Document => {
      if (typeof result === "string") {
        return { pageContent: result, metadata: {} };
      }
      return result;
    };

    const results = hasStringResults
      ? params.results?.map(normalizeResult)
      : params.results;

    return {
      kind: "vector",
      ...params,
      results,
    };
  }

  _logLiveTrace(trace: MonitoringTrace) {
    if (this.mode !== TracingMode.MONITORING) {
      console.warn(`Tracing mode must be set to <monitoring>!`);
      return;
    }

    this.client.logger.log({
      type: LogMessageType.MONITORING,
      payload: trace,
    });
  }

  log(key: string, value: unknown): void;
  log(trace: TraceEvent): void;
  log(keyOrTrace: string | TraceEvent, value?: unknown): void {
    if (this.mode === TracingMode.MONITORING) {
      const context = this.client.monitoring._getTraceContext();

      if (typeof keyOrTrace === "string") {
        this._logLiveTrace({
          ...context,
          event: { [keyOrTrace]: value },
        });
      } else {
        this._logLiveTrace({
          ...context,
          event: keyOrTrace,
        });
      }
    } else if (this.mode === TracingMode.EXPERIMENT) {
      if (typeof keyOrTrace === "string") {
        this.collected.push({ [keyOrTrace]: value });
      } else {
        this.collected.push(keyOrTrace);
      }
    } else
      console.warn("Attempt to send a log trace, but tracing mode is off!");
  }

  logGeneration(params: GenerationParams): void {
    this.log(this._generationEvent(params));
  }

  logRetrieval(params: RetrievalEventParams): void {
    this.log(this._retrievalEvent(params));
  }
}
