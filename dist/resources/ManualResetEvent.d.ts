declare class ManualResetEvent {
    private isSet;
    private waiters;
    constructor(isSet?: boolean);
    set(): void;
    reset(): void;
    wait(): Promise<unknown>;
    resolveWaiters(): void;
}

export { ManualResetEvent };
