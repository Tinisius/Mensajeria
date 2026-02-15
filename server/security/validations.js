import { getUsersCollection } from "../db/mongo.js";

//obtiene los mensajes
export async function userExists(username) {
  const users = await getUsersCollection();
  if (!users) {
    return null;
  }
  const user = await users.findOne({ user: username });
  return user ? true : false;
}

export async function matchPassword(username, password) {
  const users = await getUsersCollection();
  if (!users) {
    return null;
  }
  const user = await users.findOne({ user: username });
  return user.password === password;
}
