import type { Hamming } from "../index";
import { LogMessageType } from "../types/asyncLogger";
import { ExperimentContext } from "../types/experiments";
import { MonitoringTrace, MonitoringTraceContext } from "../types/monitoring";
import {
  Context,
  Document,
  GenerationParams,
  ITracing,
  RetrievalParams,
  Trace,
  TraceEvent,
  TracingMode,
} from "../types/tracing";

export class Tracing implements ITracing {
  private client: Hamming;
  private collected: Record<string, TraceEvent[]> = {};
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

    const events = this.collected[experimentItemId] ?? [];
    delete this.collected[experimentItemId];

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

  private _retrievalEvent(params: RetrievalParams): TraceEvent {
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

    this.client._logger.log({
      type: LogMessageType.MONITORING,
      payload: trace,
    });
  }

  log(key: string, value: unknown, ctx?: Context): void;
  log(trace: TraceEvent, ctx?: Context): void;
  log(
    keyOrTrace: string | TraceEvent,
    valueOrCtx?: unknown | Context,
    ctx?: Context,
  ): void {
    const { event, context } = (() => {
      const isKeyValue = typeof keyOrTrace === "string";
      if (isKeyValue) {
        const key = keyOrTrace as string;
        const value = valueOrCtx as unknown;
        const event: TraceEvent = { [key]: value };
        const context = ctx;
        return { event, context };
      } else {
        const event = keyOrTrace as TraceEvent;
        const context = valueOrCtx as Context;
        return { event, context };
      }
    })();

    if (this.mode === TracingMode.EXPERIMENT) {
      const experimentContext = context as ExperimentContext;

      const experimentItemId = experimentContext?.experiment?.itemId;
      if (!experimentItemId) {
        throw new Error(
          "Experiment item ID not found, use the new API 'ctx.tracing'.",
        );
      }
      if (!this.collected[experimentItemId]) {
        this.collected[experimentItemId] = [];
      }
      this.collected[experimentItemId].push(event);
    } else if (this.mode === TracingMode.MONITORING) {
      const monitoringContext = context as MonitoringTraceContext;

      const trace = this.client.monitoring._getTraceContext(
        monitoringContext.seqId,
      );

      this._logLiveTrace({
        event,
        ...trace,
      });
    } else
      console.warn("Attempt to send a log trace, but tracing mode is off!");
  }

  logGeneration(params: GenerationParams, ctx?: Context): void {
    this.log(this._generationEvent(params), ctx);
  }

  logRetrieval(params: RetrievalParams, ctx?: Context): void {
    this.log(this._retrievalEvent(params), ctx);
  }
}

export class TracingWrapper implements ITracing {
  private wrapped: Tracing;
  private ctx: Context;

  constructor(tracing: Tracing, context: Context) {
    this.wrapped = tracing;
    this.ctx = context;
  }

  logGeneration(params: GenerationParams): void {
    this.wrapped.logGeneration(params, this.ctx);
  }

  logRetrieval(params: RetrievalParams): void {
    this.wrapped.logRetrieval(params, this.ctx);
  }

  log(keyOrTrace: string | TraceEvent, value?: unknown): void {
    if (typeof keyOrTrace === "string") {
      this.wrapped.log(keyOrTrace, value, this.ctx);
    } else {
      this.wrapped.log(keyOrTrace, this.ctx);
    }
  }
}
