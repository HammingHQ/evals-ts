import { RetellCallEvent, VapiCallEvent } from "../types";

export function parseRetellCallId(event: RetellCallEvent): string | undefined {
  const call_id = event.call.call_id;
  if (!call_id || typeof call_id !== "string") {
    return undefined;
  }
  return call_id;
}

export function parseVapiCallId(event: VapiCallEvent): string | undefined {
  const call = event.message.call as Record<string, unknown>;
  if (!call || typeof call !== "object") {
    return undefined;
  }
  const call_id = call.id;
  if (!call_id || typeof call_id !== "string") {
    return undefined;
  }
  return call_id;
}
