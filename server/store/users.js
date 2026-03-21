///3.0
import { getUsersCollection } from "../db/mongo.js";

export async function saveUser(username, password, ip) {
  const normalized = {
    user: username,
    password: password,
    ip,
    createdAt: new Date(),
  };

  const UsersCollection = await getUsersCollection();

  if (!password || password.length >= 20) {
    throw new Error("contraseña invalida"); //corta el flujo
  }
  if (!username || username.length >= 20) {
    throw new Error("usuario invalido"); //corta el flujo
  }

  if (UsersCollection) {
    await UsersCollection.insertOne(normalized); //inserta el usuario
  }
  return normalized;
}
