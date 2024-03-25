import { asyncRunContext } from "../asyncStorage";
import type { Hamming } from "../client";
import {
  Document,
  GenerationParams,
  RetrievalParams,
  Trace,
  TraceEvent,
} from "../types";

interface ITracing {
  logGeneration(params: GenerationParams): void;
  logRetrieval(params: RetrievalParams): void;
  log(key: string, value: unknown): void;
  log(trace: TraceEvent): void;
}

export class Tracing implements ITracing {
  private client: Hamming;
  private collected: Record<string, TraceEvent[]> = {};
  private currentLocalTraceId: number = 0;

  constructor(client: Hamming) {
    this.client = client;
  }

  private nextTraceId(): number {
    return this.currentLocalTraceId++;
  }

  async _flush(experimentItemId: string) {
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

  log(key: string, value: unknown): void;
  log(trace: TraceEvent): void;
  log(keyOrTrace: string | TraceEvent, value?: unknown): void {
    const event = (() => {
      const isKeyValue = typeof keyOrTrace === "string";
      if (isKeyValue) {
        const key = keyOrTrace as string;
        const event: TraceEvent = { [key]: value };
        return event;
      } else {
        const event = keyOrTrace as TraceEvent;
        return event;
      }
    })();

    const runCtx = asyncRunContext.getStore();
    const itemId = runCtx?.tracing?.experiment?.itemId;

    if (!itemId) {
      console.error("Unable to log trace event without experiment item ID.");
      return;
    }
    if (!this.collected[itemId]) {
      this.collected[itemId] = [];
    }
    this.collected[itemId].push(event);
  }

  logGeneration(params: GenerationParams): void {
    this.log(this._generationEvent(params));
  }

  logRetrieval(params: RetrievalParams): void {
    this.log(this._retrievalEvent(params));
  }
}
