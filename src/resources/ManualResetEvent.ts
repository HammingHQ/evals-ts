export class ManualResetEvent {
  private isSet: boolean;
  private waiters: Array<(...args: any) => void>;

  constructor(isSet = false) {
    this.isSet = isSet;
    this.waiters = [];
    if (isSet) {
      this.resolveWaiters();
    }
  }

  // Signal the event, allowing all waiting promises to continue
  set() {
    this.isSet = true;
    this.resolveWaiters();
  }

  // Reset the event, causing future callers to wait
  reset() {
    this.isSet = false;
  }

  // Wait on the event, the promise resolves when the event is set
  wait() {
    if (this.isSet) {
      return Promise.resolve();
    }
    // Create a new promise that will be resolved when the event is set
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  // Resolve all waiting promises
  resolveWaiters() {
    this.waiters.forEach((resolve) => resolve());
    this.waiters = [];
  }
}
