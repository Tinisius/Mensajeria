import { getChatsCollection } from "../db/mongo.js";

//guarda el chat
export async function saveChat(chatName, chatPassword, username) {
  const normalized = {
    chatID: chatName,
    chatPassword: chatPassword,
    owner: username,
    createdAt: new Date(),
  };

  const ChatCollection = await getChatsCollection(); //obtiene la colleccion de chats de la DB

  if (!ChatCollection) return;

  await ChatCollection.insertOne(normalized); //inserta el chat
  return normalized;
}

//obtiene los mensajes
export async function getChats() {
  const ChatCollection = await getChatsCollection();

  if (!ChatCollection) return;

  //devuelve la coleccion ordenada y truncada en forma de array (no filtra pero podria)
  const docs = await ChatCollection.find({}).sort({ createdAt: -1 }).toArray();

  return docs.reverse();
}
