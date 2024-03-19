const MAX_WORKERS = 100;

export async function runWorkers<T>(
  workItems: T[],
  runFn: (workItem: T) => Promise<void>,
  count: number = MAX_WORKERS,
) {
  const iterator = workItems.entries();
  const workerCount = Math.min(count, workItems.length, MAX_WORKERS);
  const workers = Array(workerCount)
    .fill(iterator)
    .map(async (iterator, idx) => {
      for (const [index, workItem] of iterator) {
        if (process.env.NODE_ENV === "development") {
          console.log(`Worker ${idx} is processing task ${index}`);
        }
        await runFn(workItem);
        if (process.env.NODE_ENV === "development") {
          console.log(`Worker ${idx} has finished task ${index}`);
        }
      }
    });
  await Promise.all(workers);
}
