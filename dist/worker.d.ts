declare function runWorkers<T>(workItems: T[], runFn: (workItem: T) => Promise<void>, count?: number): Promise<void>;

export { runWorkers };
