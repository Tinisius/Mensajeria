import { getUsersCollection, getChatsCollection } from "../db/mongo.js";

//obtiene los mensajes
export async function userExists(username) {
  const usersCollection = await getUsersCollection();
  if (!usersCollection) {
    return null;
  }
  const user = await usersCollection.findOne({ user: username });
  return user ? true : false;
}

export async function matchPassword(username, password) {
  const usersCollection = await getUsersCollection();
  if (!usersCollection) {
    return null;
  }
  const user = await usersCollection.findOne({ user: username });
  return user.password === password;
}

export async function chatExists(chatName) {
  const chatsCollection = await getChatsCollection();
  if (!chatsCollection) {
    return null;
  }
  const chat = await chatsCollection.findOne({ chatID: chatName });
  return chat ? true : false;
}

export async function matchChatPassword(chatName, password) {
  const chatsCollection = await getChatsCollection();
  if (!chatsCollection) {
    return null;
  }
  const chat = await chatsCollection.findOne({ chatID: chatName });
  return chat.chatPassword === password;
}
