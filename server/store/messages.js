import { getMessagesCollection } from "../db/mongo.js";

const inMemoryMessages = [];
const MAX_MESSAGES = 100;

function trimInMemory() {
  if (inMemoryMessages.length > MAX_MESSAGES) {
    inMemoryMessages.splice(0, inMemoryMessages.length - MAX_MESSAGES);
  }
}

export async function saveMessage(message) {
  const normalized = {
    type: "message",
    text: message.text,
    color: message.color,
    font: message.font,
    createdAt: new Date(),
  };

  const collection = await getMessagesCollection();

  if (!collection) {
    inMemoryMessages.push(normalized);
    trimInMemory();
    return normalized;
  }

  await collection.insertOne(normalized);
  return normalized;
}

export async function getRecentMessages(limit = 50) {
  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), MAX_MESSAGES) : 50;

  const collection = await getMessagesCollection();

  if (!collection) {
    return inMemoryMessages.slice(-safeLimit);
  }

  const docs = await collection
    .find({ type: "message" })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .toArray();

  return docs.reverse();
}
