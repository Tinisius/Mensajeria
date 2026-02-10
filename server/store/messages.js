import { findRecentMessages, insertMessage } from "../db/mongo.js";

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
    createdAt: new Date().toISOString(),
  };

  const result = await insertMessage(normalized);

  if (!result) {
    inMemoryMessages.push(normalized);
    trimInMemory();
  }

  return normalized;
}

export async function getRecentMessages(limit = 50) {
  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), MAX_MESSAGES) : 50;

  const docs = await findRecentMessages(safeLimit);

  if (!docs) {
    return inMemoryMessages.slice(-safeLimit);
  }

  return docs.reverse();
}
