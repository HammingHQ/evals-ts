import type { Hamming } from "../index";
import { LogMessage } from "../types/asyncLogger";
import { ManualResetEvent } from "./ManualResetEvent";

const LOG_BATCH_SIZE = 512;

export class AsyncLogger {
  private client: Hamming;

  private queue: LogMessage[];
  private stopEvent: boolean;
  private queueNotEmptyEvent: ManualResetEvent;

  constructor(client: Hamming) {
    this.client = client;

    this.queue = [];
    this.stopEvent = false;
    this.queueNotEmptyEvent = new ManualResetEvent();
  }

  log(message: LogMessage): void {
    this.queue.push(message);
    this.queueNotEmptyEvent.set();
  }

  async start(): Promise<void> {
    console.log("Starting logger thread..");
    while (!this.stopEvent) {
      await this.queueNotEmptyEvent.wait();
      await this._processQueue();
    }
    console.log("Logger thread exited!");
  }

  stop(): void {
    console.log("Waiting for logger thread to exit..");
    this.stopEvent = true;
  }

  private _drainQueue(): LogMessage[] {
    const batchSize = Math.min(this.queue.length, LOG_BATCH_SIZE);

    const drainedMessages = this.queue.splice(0, batchSize);

    return drainedMessages;
  }

  private async _processQueue(): Promise<void> {
    const msgs_to_process: LogMessage[] = this._drainQueue();

    await this._publish(msgs_to_process);

    if (this.queue.length === 0) this.queueNotEmptyEvent.reset();
  }

  private async _publish(msgs: LogMessage[]): Promise<void> {
    console.log(`Publishing ${msgs.length} messages..`);
    try {
      await this.client.fetch("/logs", {
        method: "POST",
        body: JSON.stringify({
          logs: msgs.map((msg) => ({
            ...msg,
            payload: {
              ...msg.payload,
              session_id: msg.payload?.sessionId,
              seq_id: msg.payload?.seqId,
              parent_seq_id: msg.payload?.parentSeqId,
            },
          })),
        }),
      });
      console.log(`Published ${msgs.length} messages!`);
    } catch (e) {
      console.error(`Failed to publish messages: ${e}`);
    }
  }
}
