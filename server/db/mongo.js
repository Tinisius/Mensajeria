const dataApiUrl = process.env.MONGODB_DATA_API_URL;
const apiKey = process.env.MONGODB_DATA_API_KEY;
const dataSource = process.env.MONGODB_DATA_SOURCE || "Cluster0";
const database = process.env.MONGODB_DB_NAME || "mensajeria";
const collection = process.env.MONGODB_COLLECTION || "messages";

let warned = false;

function canUseDataApi() {
  return Boolean(dataApiUrl && apiKey);
}

function headers() {
  return {
    "Content-Type": "application/json",
    "api-key": apiKey,
  };
}

async function request(action, body) {
  const response = await fetch(`${dataApiUrl}/${action}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ dataSource, database, collection, ...body }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mongo Data API (${action}) ${response.status}: ${detail}`);
  }

  return response.json();
}

export async function insertMessage(document) {
  if (!canUseDataApi()) {
    if (!warned) {
      console.warn(
        "[mongo] Faltan variables MONGODB_DATA_API_URL o MONGODB_DATA_API_KEY. Se usará almacenamiento en memoria."
      );
      warned = true;
    }
    return null;
  }

  return request("insertOne", { document });
}

export async function findRecentMessages(limit = 50) {
  if (!canUseDataApi()) {
    return null;
  }

  const result = await request("find", {
    filter: { type: "message" },
    sort: { createdAt: -1 },
    limit,
  });

  return result.documents ?? [];
}
