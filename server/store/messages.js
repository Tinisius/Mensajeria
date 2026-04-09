///2.0 se encarga de obtener los mensajes y devolverlos al servidor y de recibir los mensajes del dervidor y guardarlos en la DB
import { normalize } from "path";
import { getMessagesCollection } from "../db/mongo.js";
import { ObjectId } from "mongodb"; //para usar findOne
import { log } from "console";

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

  if (message.type === "ticTacToe") {
    normalized.data = {
      state: "pending",
      users: [message.user, null],
      board: Array(9).fill(null),
      turn: "x",
      winner: null,
    };
  } else {
    normalized.user = message.user;
    normalized.text = message.text;
    normalized.color = message.color;
    normalized.font = message.font;
  }

  const messagesCollection = await getMessagesCollection(); //obtiene la colleccion de msg de la DB

  if (!messagesCollection) {
    inMemoryMessages.push(normalized);
    trimInMemory();
    return normalized;
  }

  const result = await messagesCollection.insertOne(normalized); //inserta el mensaje
  return {
    ...normalized,
    _id: result.insertedId,
  };
}

export async function editTicTacToe(obj) {
  const messagesCollection = await getMessagesCollection();
  const game = await messagesCollection.findOne({ _id: new ObjectId(obj._id) });
  if (game.data.users[1] === null && obj.user != game.data.users[0]) {
    const newTurn = game.data.turn === "x" ? "o" : "x";
    const edit = await messagesCollection.updateOne(
      { _id: new ObjectId(obj._id) },
      {
        $set: {
          [`data.board.${obj.move.cell}`]: game.data.turn,
          "data.turn": newTurn,
          ["data.users.1"]: obj.user,
        },
      },
    );
    return {
      ok: edit.modifiedCount != 0,
      turn: game.data.turn,
      players: [game.data.users[0], obj.user],
    };
  }
  if (
    (game.data.users[0] === obj.user && game.data.turn === "x") ||
    (game.data.users[1] === obj.user && game.data.turn === "o")
  ) {
    const edit = await messagesCollection.updateOne(
      { _id: new ObjectId(obj._id) },
      {
        $set: {
          [`data.board.${obj.move.cell}`]: game.data.turn,
          "data.turn": game.data.turn === "x" ? "o" : "x",
        },
      },
    );
    return {
      ok: edit.modifiedCount != 0,
      turn: game.data.turn,
      players: [game.data.users[0], game.data.users[1]],
    };
  }
  return { ok: false };
}

//obtiene los mensajes
export async function getRecentMessages(limit = 50, chat) {
  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), MAX_MESSAGES)
    : 50;

  const messagesCollection = await getMessagesCollection();

  if (!messagesCollection) {
    return inMemoryMessages.slice(-safeLimit);
  }

  //devuelve la coleccion ordenada y truncada en forma de array (no filtra pero podria)
  const docs = await messagesCollection
    .find({ chat: chat })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .toArray();

  return docs.reverse();
}
