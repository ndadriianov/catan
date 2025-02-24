import {ConnectionStatus} from './User';
import {Owner} from './Gameboard';

export class Player {
  username: string;
  inventory: Inventory;
  status: ConnectionStatus;
  leftTheRoom: boolean;
  color: Owner;
  
  
  constructor(username: string) {
    this.username = username;
    this.inventory = new Inventory();
    this.status = ConnectionStatus.Green;
    this.leftTheRoom = false;
    this.color = Owner.nobody;
  }
  
  
  toJSON() {
    return {
      username: this.username,
      inventory: this.inventory,
      status: this.status,
      leftTheRoom: this.leftTheRoom,
      color: this.color
    };
  }
}



export type Coords = {
  x: number;
  y: number;
}


export class Inventory {
  clay: number;
  forrest: number;
  sheep: number;
  stone: number;
  wheat: number;
  roads: Coords[];
  villages: Coords[];
  cities: Coords[];
  
  
  constructor() {
    this.clay = 0;
    this.forrest = 0;
    this.sheep = 0;
    this.stone = 0;
    this.wheat = 0;
    this.roads = [];
    this.villages = [];
    this.cities = [];
  }
}


export type updateProps = {
  villages: Coords[];
  cities: Coords[];
  roads: Coords[];
}