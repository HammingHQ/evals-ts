import { RetellCallEvent } from "../types";

export function parseRetellCallId(event: RetellCallEvent): string | undefined {
  const call_id = event.call.call_id;
  if (!call_id) {
    return undefined;
  }
  if (typeof call_id !== "string") {
    return undefined;
  }
  return call_id;
}
