///3.0
import { getUsersCollection } from "../db/mongo.js";

export async function saveUser(username, password) {
  const normalized = {
    user: username,
    password: password,
    createdAt: new Date(),
  };

  const users = await getUsersCollection();

  if (!password || password.length >= 20) {
    throw new Error("contraseña invalida"); //corta el flujo
  }
  if (!username || username.length >= 20) {
    throw new Error("usuario invalida"); //corta el flujo
  }

  if (users) {
    await users.insertOne(normalized); //inserta el usuario
  }
  return normalized;
}
