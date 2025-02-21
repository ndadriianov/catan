export type Room = {
  id: number;
  players: Player[];
  activePlayer: string;
  counter: number;
  haveStarted: boolean;
  gameboard?: Gameboard;
}

export type jsonRoom = Omit<Room, 'players'> & {
  players: jsonPlayer[];
}

export type Player = {
  username: string;
  status: ConnectionStatus;
  inventory: Inventory;
  color: Owner;
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


export enum tile {
  forrest,    //4
  wheat,      //4
  sheep,      //4
  clay,       //3
  stone,      //3
  wasteland   //1
}

enum houseType {
  village,
  city
}

type House = {
  owner: Owner;
  type: houseType;
}

export type Gameboard = {
  tiles: tile[][];
  houses: House[][];
  roads: Owner[][];
  numbers: number[][];
}

function parseGameboard(gameboardJSON: Gameboard) {
  return {
    tiles: gameboardJSON.tiles,
    houses: gameboardJSON.houses,
    roads: gameboardJSON.roads,
    numbers: gameboardJSON.numbers,
  };
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
  orange
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
    inventory: parseInventory(playerJSON.inventory),
    color: playerJSON.color,
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
      activePlayer: roomJSON.activePlayer,
      counter: roomJSON.counter,
      haveStarted: roomJSON.haveStarted as boolean,
      gameboard: roomJSON.gameboard ? parseGameboard(roomJSON.gameboard) : undefined
    };
  } catch (e) {
    console.log("Error parsing room:", e);
    return null;
  }
}