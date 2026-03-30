///2.0 se encarga de obtener los mensajes y devolverlos al servidor y de recibir los mensajes del dervidor y guardarlos en la DB
import { normalize } from "path";
import { getMessagesCollection } from "../db/mongo.js";

const inMemoryMessages = []; //si falla la conexion con la DB, guarda los mensajes en memoria
const MAX_MESSAGES = 100;

function trimInMemory() {
  if (inMemoryMessages.length > MAX_MESSAGES) {
    inMemoryMessages.splice(0, inMemoryMessages.length - MAX_MESSAGES);
  }
}

//guarda el mensaje
export async function saveMessage(message) {
  //normalized seria el mensaje a guardar
  const normalized = {
    chat: message.chat,
    type: message.type,
    createdAt: new Date(),
  };

  if (message.type === "TTT_pending") {
    normalized.data = {
      users: [message.user, null],
      board: Array(9).fill(null),
      turn: "×",
      winner: null,
    };
  } else {
    normalized.user = message.user;
    normalized.text = message.text;
    normalized.color = message.color;
    normalized.font = message.font;
  }

  const collection = await getMessagesCollection(); //obtiene la colleccion de msg de la DB

  if (!collection) {
    inMemoryMessages.push(normalized);
    trimInMemory();
    return normalized;
  }

  const result = await collection.insertOne(normalized); //inserta el mensaje
  return {
    ...normalized,
    _id: result.insertedId,
  };
}

export async function editTicTacToe(obj) {
  const collection = await getMessagesCollection();
  await collection.updateOne(
    { _id: obj.id },
    {
      $set: {
        [`data.board.${obj.cell}`]: obj.player,
      },
    },
  );
}

//obtiene los mensajes
export async function getRecentMessages(limit = 50, chat) {
  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), MAX_MESSAGES)
    : 50;

  const collection = await getMessagesCollection();

  if (!collection) {
    return inMemoryMessages.slice(-safeLimit);
  }

  //devuelve la coleccion ordenada y truncada en forma de array (no filtra pero podria)
  const docs = await collection
    .find({ chat: chat })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .toArray();

  return docs.reverse();
}
