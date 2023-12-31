import { envsafe, str } from "envsafe";
import { Hamming } from "hamming-sdk";

import dotenv from "dotenv";
dotenv.config();

export const env = envsafe({
  HAMMING_API_KEY: str(),
  HAMMING_BASE_URL: str(),
});

const hamming = new Hamming({
  apiKey: env.HAMMING_API_KEY,
  baseURL: env.HAMMING_BASE_URL,
});

async function run() {
  const dataset = await hamming.datasets.create({
    name: "test dataset",
    items: [
      { 
        input: { query: "Sam" }, 
        output: { response: "Hi Sam" },
        metadata: {},
      },
      { 
        input: { query: "Ela" }, 
        output: { response: "Hi Ela" },
        metadata: {},
      },
      { 
        input: { query: "Joe" }, 
        output: { response: "Hello Joe" },
        metadata: {},
      },
    ],
  });
  
  hamming.experiments.run({
    name: "test experiment",
    dataset: dataset.id,
  }, async ({ query }) => {
    console.log(`Query: ${query}`);

    // Do meaningful work..
    const sleepMs = Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, sleepMs));

    const response = `Hi ${query}`;
    console.log(`Response: ${response}`);

    return { response };
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
