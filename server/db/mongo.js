///2.0 realiza las peticiones a la base de datos y se las devuelve messages.js, luego messages se encarga de procesarlos
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DB_NAME || "mensajeria";
const messagesCollectionName = process.env.MONGODB_COLLECTION || "messages";
const usersCollectionName = process.env.MONGODB_USERS || "users";
const chatsCollectionName = process.env.MONGODB_CHATS || "chats";

let warned = false;
let client;
let messagesCollection;
let usersCollection;
let chatsCollection;

export async function getMessagesCollection() {
  if (!uri) {
    if (!warned) {
      console.warn(
        "[mongo] Falta MONGODB_URI. Se usará almacenamiento en memoria.",
      );
      warned = true;
    }
    return null;
  }
  if (messagesCollection) {
    return messagesCollection;
  }
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("[mongo] Conectado a MongoDB Atlas");
  }

  messagesCollection = client.db(database).collection(messagesCollectionName); //realiza la peticion
  return messagesCollection;
}

export async function getUsersCollection() {
  if (!uri) {
    if (!warned) {
      console.warn(
        "[mongo] Falta MONGODB_URI. Se usará almacenamiento en memoria.",
      );
      warned = true;
    }
  }
  if (usersCollection) {
    return usersCollection;
  }
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("[mongo] Conectado a MongoDB Atlas");
  }
  usersCollection = client.db(database).collection(usersCollectionName);
  return usersCollection;
}

export async function getChatsCollection() {
  if (!uri) {
    if (!warned) {
      console.warn(
        "[mongo] Falta MONGODB_URI. Se usará almacenamiento en memoria.",
      );
      warned = true;
    }
  }
  if (chatsCollection) {
    return chatsCollection;
  }
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("[mongo] Conectado a MongoDB Atlas");
  }
  chatsCollection = client.db(database).collection(chatsCollectionName);
  return chatsCollection;
}

export async function closeMongoConnection() {
  if (client) {
    await client.close();
    client = undefined;
    collection = undefined;
  }
}
