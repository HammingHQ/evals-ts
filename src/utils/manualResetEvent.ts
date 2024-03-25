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

  set() {
    this.isSet = true;
    this.resolveWaiters();
  }

  reset() {
    this.isSet = false;
  }

  wait() {
    if (this.isSet) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  resolveWaiters() {
    this.waiters.forEach((resolve) => resolve());
    this.waiters = [];
  }
}
