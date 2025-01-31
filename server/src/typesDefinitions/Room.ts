import {EventEmitter} from 'node:events';


export class Room {
  id: number;
  private _players: Array<Player>;
  private _haveStarted: boolean;
  private _eventEmitter: EventEmitter;
  
  
  get players() {
    return this._players;
  }
  
  
  addPlayer(username: string): boolean {
    if (this._players.length < 4 && !this._haveStarted) {
      if (this._players.find((player) => player.username === username)) return false;
      
      this._players.push(new Player(username));
      this._eventEmitter.emit('update', this.id);
      return true;
    }
    else {
      return false;
    }
  }
  
  
  removePlayer(username: string): boolean {
    if (this._haveStarted) return false;
    
    if (this._players.find((player) => player.username === username)) {
      
      this._players = this._players.filter(player => player.username !== username);
      this._eventEmitter.emit('update', this.id);
      return true;
    }
    
    return false;
  }
  
  
  start(): void {
    this._haveStarted = true;
    this._eventEmitter.emit('update', this.id);
  }
  
  
  toJSON() {
    return {
      id: this.id,
      players: this._players.map(player => ({
        username: player.username,
        inventory: {
          clay: player.inventory.clay,
          forrest: player.inventory.forrest,
          sheep: player.inventory.sheep,
          stone: player.inventory.stone,
          wheat: player.inventory.wheat,
        },
      })),
      haveStarted: this._haveStarted,
    };
  }
  
  
  constructor(id: number, eventEmitter: EventEmitter) {
    this.id = id;
    this._players = [];
    this._haveStarted = false;
    this._eventEmitter = eventEmitter;
  }
}




class Player {
  username: string;
  inventory: Inventory;
  
  constructor(username: string) {
    this.username = username;
    this.inventory = new Inventory();
  }
}




class Inventory {
  clay: number;
  forrest: number;
  sheep: number;
  stone: number;
  wheat: number;
  
  constructor() {
    this.clay = 0;
    this.forrest = 0;
    this.sheep = 0;
    this.stone = 0;
    this.wheat = 0;
  }
}