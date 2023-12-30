import { envsafe, str } from "envsafe";
import { Hamming } from "hamming-sdk";

import dotenv from "dotenv";
dotenv.config();

export const env = envsafe({
  HAMMING_API_KEY: str(),
  HAMMING_BASE_URL: str(),
});

async function run() {
  console.log("Starting test..");

  const hamming = new Hamming({
    apiKey: env.HAMMING_API_KEY,
    baseURL: env.HAMMING_BASE_URL,
  });

  const dataset = await hamming.datasets.load(1);
  const experiment = await hamming.experiments.start("test", dataset.id);

  console.log("Experiment started..", experiment.id);

  for (const dataItem of dataset.items) {
    const experimentItem = hamming.experiments.items.start(experiment, dataItem);
    console.log(`Started item ${dataItem.id}..`);

    const input = dataItem.input.query;
    console.log(`Input: ${input}`);

    // Do meaningful work..
    const sleepMs = Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, sleepMs));

    const output = {
      response: `Hi ${input}`,
    };

    await hamming.experiments.items.end(experimentItem, output);
    console.log(`Finished item ${dataItem.id}..`);
  }

  await hamming.experiments.end(experiment);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
