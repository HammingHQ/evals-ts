import { Hamming } from "hamming-sdk";

enum MetadataKey {
  Category = "category",
  Ranking = "ranking",
  Labels = "labels",
  RiskLevel = "risk_level",
  Rarity = "rarity",
  OriginalAuthor = "original_author",
  TopLibraries = "top_libraries",
}

type Metadata = Record<string, unknown>;

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMultipleChoice<T>(arr: T[], count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(randomChoice(arr));
  }
  return result;
}

const categories = ["Puzzle", "Scientific", "Trivia", "Vocabulary", "Legal"];
const labels = ["creative", "long form", "short form", "funny", "serious", "educational", "inspiring", "scary", "informative", "entertaining", "thought provoking", "controversial", "political", "satirical", "emotional"];
const originalAuthors = ["Sam Cook", "Fred Bernstein", "Carry Grant", "Serge Effin"];
const topLibraries = ["React", "Vue", "Angular", "Ember", "Svelte"];

function generateRandomMetadata(): Metadata {
  const fullMetadata: Metadata = {
    [MetadataKey.Category]: randomChoice(categories),
    [MetadataKey.Ranking]: Math.floor(Math.random() * 100),
    [MetadataKey.Labels]: randomMultipleChoice(labels, Math.floor(Math.random() * 5)),
    [MetadataKey.RiskLevel]: Math.random() > 0.5 ? "low" : "high",
    [MetadataKey.Rarity]: Math.random(),
    [MetadataKey.OriginalAuthor]: randomChoice(originalAuthors),
    [MetadataKey.TopLibraries]: randomMultipleChoice(topLibraries, Math.floor(Math.random() * 3))
  };
  const keepMetadataKey = Array.from(Object.keys(fullMetadata)).filter(() => Math.random() > 0.5);
  const metadata: Metadata = {};
  for (const key of keepMetadataKey) {
    metadata[key] = fullMetadata[key];
  }
  return metadata;
}

export async function createLargeDataset(hamming: Hamming, itemCount: number) {
  const items = [];
  for (let i = 0; i < itemCount; i++) {
    console.log(`Dataset item ${i} of ${itemCount}`);
    console.log(`Metadata: ${JSON.stringify(generateRandomMetadata())}`);
    items.push({
      input: { query: `Query ${i}` },
      output: { response: `Response ${i}` },
      metadata: generateRandomMetadata(),
    });
  }
  const dataset = await hamming.datasets.create({
    name: "Large Test Dataset with Metadata",
    items,
  });
  console.log(`Created dataset ${dataset.id}`);
}
