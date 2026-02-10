import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DB_NAME || "mensajeria";
const collectionName = process.env.MONGODB_COLLECTION || "messages";

let warned = false;
let client;
let collection;

export async function getMessagesCollection() {
  if (!uri) {
    if (!warned) {
      console.warn("[mongo] Falta MONGODB_URI. Se usará almacenamiento en memoria.");
      warned = true;
    }
    return null;
  }

  if (collection) {
    return collection;
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("[mongo] Conectado a MongoDB Atlas");
  }

  collection = client.db(database).collection(collectionName);
  return collection;
}

export async function closeMongoConnection() {
  if (client) {
    await client.close();
    client = undefined;
    collection = undefined;
  }
}
