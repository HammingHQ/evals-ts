import type { Hamming } from "./index";
import { LogMessage } from "./types";
import { ManualResetEvent } from "./utils/manualResetEvent";

const LOG_BATCH_SIZE = 512;

export class Logger {
  private client: Hamming;

  private queue: LogMessage[] = [];
  private stopped: boolean = false;
  private queueHasMessages = new ManualResetEvent();

  constructor(client: Hamming) {
    this.client = client;
  }

  log(message: LogMessage): void {
    this.queue.push(message);
    this.queueHasMessages.set();
  }

  async start(): Promise<void> {
    console.log("Starting logger thread..");
    while (!this.stopped) {
      await this.queueHasMessages.wait();
      await this._processQueue();
    }
    await this._processQueue();
    console.log("Logger thread exited!");
  }

  stop(): void {
    console.log("Waiting for logger thread to exit..");
    this.stopped = true;
  }

  private _drainQueue(): LogMessage[] {
    const batchSize = Math.min(this.queue.length, LOG_BATCH_SIZE);
    const drainedMessages = this.queue.splice(0, batchSize);
    return drainedMessages;
  }

  private async _processQueue(): Promise<void> {
    const messages = this._drainQueue();
    await this._publish(messages);
    // TODO: test and set
    if (this.queue.length === 0) {
      this.queueHasMessages.reset();
    }
  }

  private async _publish(msgs: LogMessage[]): Promise<void> {
    if (msgs.length === 0) {
      return;
    }
    if (process.env.NODE_ENV === "development") {
      console.log(`Publishing ${msgs.length} message(s)..`);
    }
    try {
      await this.client.fetch("/logs", {
        method: "POST",
        body: JSON.stringify({
          logs: msgs.map((msg) => ({
            ...msg,
            payload: {
              ...msg.payload,
              session_id: msg.payload?.session_id,
              seq_id: msg.payload?.seq_id,
              parent_seq_id: msg.payload?.parent_seq_id,
            },
          })),
        }),
      });
      if (process.env.NODE_ENV === "development") {
        console.log(`Published ${msgs.length} messages!`);
      }
    } catch (e) {
      console.error(`Failed to publish messages: ${e}`);
    }
  }
}
