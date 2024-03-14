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
    this.queue = [];
    this.stopEvent = false;
    this.queueNotEmptyEvent = new ManualResetEvent();
  }

  log(message: LogMessage): void {
    this.queue.push(message);
    this.queueNotEmptyEvent.set();
  }

  async start(): Promise<void> {
    while (!this.stopEvent) {
      await this.queueNotEmptyEvent.wait();
      if (!this.stopEvent) {
        await this._process_queue();
      }
    }
  }

  stop(): void {
    console.log("Waiting for logger thread to exit..");
    this.stopEvent = true;
  }

  private _drain_queue(): LogMessage[] {
    const drained_msgs: LogMessage[] = [];
    while (this.queue.length > 0 && drained_msgs.length < LOG_BATCH_SIZE) {
      const msg = this.queue.shift();
      if (msg !== undefined) {
        drained_msgs.push(msg);
      }
    }
    return drained_msgs;
  }

  private async _process_queue(): Promise<void> {
    const msgs_to_process: LogMessage[] = this._drain_queue();

    await this._publish(msgs_to_process);

    if (this.queue.length > 0) {
      this.queueNotEmptyEvent.set();
    } else {
      this.queueNotEmptyEvent.reset();
    }
  }

  private async _publish(msgs: LogMessage[]): Promise<void> {
    console.log(`Publishing ${msgs.length} messages..`);
    console.log(`Messages: ${JSON.stringify(msgs)}`);
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
