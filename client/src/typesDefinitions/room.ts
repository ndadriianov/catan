export type Room = {
  id: number;
  players: Player[];
  haveStarted: boolean;
}

export type jsonRoom = Omit<Room, 'players'> & {
  players: jsonPlayer[];
}

export type Player = {
  username: string;
  status: ConnectionStatus;
  inventory: Inventory;
}

type jsonPlayer = Player & {
  leftTheRoom: boolean;
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
  Green,
  Gray
}


export enum Owner {
  nobody,
  black,
  blue,
  green,
  orange,
  red,
  yellow
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

function parsePlayer(playerJSON: jsonPlayer): Player {
  if (playerJSON.status === ConnectionStatus.Green && playerJSON.leftTheRoom) playerJSON.status = ConnectionStatus.Gray;
  return {
    username: playerJSON.username,
    status: playerJSON.status as ConnectionStatus,
    inventory: parseInventory(playerJSON.inventory)
  };
}

export function parseRoom(roomJSON: jsonRoom|null): Room|null {
  if (!roomJSON) return null;
  try {
    return {
      id: roomJSON.id,
      players: roomJSON.players.map((player: jsonPlayer): Player => {
        return parsePlayer(player);
      }),
      haveStarted: roomJSON.haveStarted as boolean,
    };
  } catch (e) {
    console.log("Error parsing room:", e);
    return null;
  }
}