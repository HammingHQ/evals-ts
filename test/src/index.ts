import { envsafe, str } from "envsafe";
import { Hamming, ScoreType } from "hamming-sdk";

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

const trace = hamming.tracing;

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

  hamming.experiments.run(
    {
      name: "test experiment",
      dataset: dataset.id,
      scoring: [ScoreType.StringDiff],
    },
    async ({ query }) => {
      console.log(`Query: ${query}`);

      trace.log('single_key', 1234);
      
      trace.log({
        "key1": "value1",
        "key2": "value2",
      });

      // Do meaningful work..
      const sleepMs = Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, sleepMs));

      trace.log(trace.VectorSearchEvent({
        query: "How many people live in New York?",
        results: [
          "The population of New York is 8 million",
          "New York is the largest city in the US",
        ],
        metadata: {
          "engine": "pinecone",
        },
      }));

      trace.log(trace.LLMEvent({
        input: "How many people live in New York?",
        output: "8 million",
        metadata: {
          "model": "t5-base",
        },
      }));

      const response = `Hi ${query}`;
      console.log(`Response: ${response}`);

      return { response };
    },
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
