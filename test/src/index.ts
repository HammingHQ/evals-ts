import { envsafe, str } from "envsafe";
import { Hamming, ScoreType } from "@hamming/hamming-sdk";
import dotenv from "dotenv";
// import { createLargeDataset } from "./dataset";

dotenv.config();

export const env = envsafe({
  HAMMING_API_KEY: str(),
  HAMMING_BASE_URL: str(),
});

const hamming = new Hamming({
  baseURL: env.HAMMING_BASE_URL,
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

async function runMonitoring() {
  hamming.monitoring.start();
  const trace = hamming.tracing;

  const question = "What is the capital of France?";
  console.log("Question: ", question);

  const resp = await hamming.monitoring.runItem(async (item) => {
    item.setInput({ question });
    item.setMetadata({ category: "geography" });

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    trace.logRetrieval({
      query: question,
      results: [
        {
          pageContent: "Paris is the capital of France",
          metadata: {},
        },
      ],
      metadata: {
        engine: "pinecone",
      },
    });

    trace.logGeneration({
      input: question,
      output: "Paris",
      metadata: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        stream: false,
        max_tokens: 1000,
        n: 1,
        seed: 42,
        temperature: 0.7,
        usage: {
          completion_tokens: 100,
          prompt_tokens: 10,
          total_tokens: 110,
        },
        duration_ms: 510,
        error: false,
      },
    });

    return { answer: "Paris" };
  });

  console.log("AI response: ", resp);

  hamming.monitoring.stop();
}

async function run() {
  // await createLargeDataset(hamming, 1000);
  // await runExperiment();
  // await simpleRagExample();
  await runMonitoring();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
