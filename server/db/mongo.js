///2.0 realiza las peticiones a la base de datos y se las devuelve messages.js, luego messages se encarga de procesarlos
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DB_NAME || "mensajeria";
const collectionName = process.env.MONGODB_COLLECTION || "messages";
const usersCollection = process.env.MONGODB_USERS || "users";

let warned = false;
let client;
let collection;
let users;

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
  if (collection) {
    return collection;
  }
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("[mongo] Conectado a MongoDB Atlas");
  }

  collection = client.db(database).collection(collectionName); //realiza la peticion
  return collection;
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
  if (users) {
    return users;
  }
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("[mongo] Conectado a MongoDB Atlas");
  }
  users = client.db(database).collection(usersCollection);
  return users;
}

export async function closeMongoConnection() {
  if (client) {
    await client.close();
    client = undefined;
    collection = undefined;
  }
}
