export type Room = {
  id: number;
  players: Player[];
  haveStarted: boolean;
}

export type Player = {
  username: string;
  status: ConnectionStatus;
  inventory: Inventory;
}

export type Inventory = {
  clay: number;
  forrest: number;
  sheep: number;
  stone: number;
  wheat: number;
}


export enum ConnectionStatus {
  Red,
  Yellow,
  Green
}


function parseInventory(inventoryJSON: Inventory): Inventory {
  return {
    clay: inventoryJSON.clay,
    forrest: inventoryJSON.forrest,
    sheep: inventoryJSON.sheep,
    stone: inventoryJSON.stone,
    wheat: inventoryJSON.wheat
  };
}

function parsePlayer(playerJSON: Player): Player {
  return {
    username: playerJSON.username,
    status: playerJSON.status as ConnectionStatus,
    inventory: parseInventory(playerJSON.inventory)
  };
}

export function parseRoom(roomJSON: Room|null): Room|null {
  if (!roomJSON) return null;
  try {
    return {
      id: roomJSON.id,
      players: roomJSON.players.map((player: Player): Player => {
        return parsePlayer(player);
      }),
      haveStarted: roomJSON.haveStarted as boolean,
    };
  } catch (e) {
    console.log("Error parsing room:", e);
    return null;
  }
}