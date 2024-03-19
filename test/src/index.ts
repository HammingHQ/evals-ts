import dotenv from "dotenv";
import { envsafe, str } from "envsafe";
import { Hamming, ScoreType } from "hamming-sdk";
// import { createLargeDataset } from "./dataset";

dotenv.config();

export const env = envsafe({
  HAMMING_API_KEY: str(),
  HAMMING_BASE_URL: str(),
});

const hamming = new Hamming({
  apiKey: env.HAMMING_API_KEY,
});

const trace = hamming.tracing;

async function doSimpleRag(question: string) {
  const translatedQuestion = `Standalone question: ${question}`;

  trace.logGeneration({
    input: question,
    output: translatedQuestion,
    metadata: {
      model: "GPT 3.5 Turbo",
    },
  });

  //This is a common structure
  const retrievedDocs = [
    {
      pageContent: "This is a sample page document",
      metadata: {
        type: "Forums",
        url: "some URL",
      },
    },
    {
      pageContent: "This is a sample page document from advisor pages",
      metadata: {
        type: "Advisor",
        url: "some URL",
      },
    },
  ];

  trace.logRetrieval({
    query: translatedQuestion,
    results: retrievedDocs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    })),
    metadata: {
      engine: "pinecone",
    },
  });

  const finalAnswer = {
    response: "This is my final answer; this could be streamed or not",
    source: retrievedDocs.map((d) => d.metadata),
  };

  // Do meaningful work..
  const sleepMs = Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, sleepMs));

  return finalAnswer;
}

async function createDataset() {
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

  return dataset;
}

async function simpleRagExample() {
  const dataset = await createDataset();

  await hamming.experiments.run(
    {
      name: "test experiment #2",
      dataset: dataset.id,
      scoring: [ScoreType.StringDiff],
    },
    async ({ query }) => {
      console.log(`Query: ${query}`);
      const output = await doSimpleRag(query);
      const response = output.response;
      return { response };
    },
  );
}

async function runExperiment() {
  const dataset = await createDataset();

  hamming.experiments.run(
    {
      name: "test experiment",
      dataset: dataset.id,
      scoring: [ScoreType.StringDiff],
    },
    async ({ query }) => {
      console.log(`Query: ${query}`);

      trace.log("single_key", 1234);

      trace.log({
        key1: "value1",
        key2: "value2",
      });

      // Do meaningful work..
      const sleepMs = Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, sleepMs));

      trace.logRetrieval({
        query: "How many people live in New York?",
        results: [
          {
            pageContent: "The population of New York is 8 million",
            metadata: {},
          },
          {
            pageContent: "New York is the largest city in the US",
            metadata: {},
          },
        ],
        metadata: {
          engine: "pinecone",
        },
      });

      trace.logGeneration({
        input: "How many people live in New York?",
        output: "8 million",
        metadata: {
          model: "t5-base",
        },
      });

      const response = `Hi ${query}`;
      console.log(`Response: ${response}`);

      return { response };
    },
  );
}

async function runExperimentWithMonitoring() {
  hamming.monitoring.start();

  for (let i = 0; i < 1; i++) {
    await hamming.monitoring.runItem((item) => {
      const question = "What are the travel restrictions in France?";

      item.setInput({ question });
      item.setMetadata({ category: "travel" });

      hamming.tracing.log({ text: "fast log" });

      hamming.tracing.logRetrieval({
        query: "tour guides for France",
        results: [
          "France is a really nice place",
          "You can travel to Paris to see the Eiffel Tower",
          "You can travel freely in France",
        ],

        metadata: {
          engine: "chroma",
        },
      });

      hamming.tracing.logGeneration({
        input: "What are the travel restrictions in France?",
        output: "You can travel freely in France",
        metadata: {
          model: "GPT-3",
        },
      });

      // const model = "gpt-3.5-turbo";
      // const messages = [
      //   { role: "system", content: "You are a helpful assistant." },
      //   {
      //     role: "user",
      //     content: "What are the travel restrictions in France?",
      //   },
      // ];

      const response = "You can travel freely in France.";

      item.setOutput({ answer: response });

      return response;
    });
  }

  hamming.monitoring.stop();
}

async function run() {
  // await createLargeDataset(hamming, 1000);
  await runExperiment();
  // await runExperimentWithMonitoring();
  // await simpleRagExample();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
