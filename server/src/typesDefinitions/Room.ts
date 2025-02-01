import {EventEmitter} from 'node:events';
import {ConnectionStatus} from './User';


export class Room {
  id: number;
  active: boolean;
  private _players: Array<Player>;
  private _haveStarted: boolean;
  private _eventEmitter: EventEmitter;
  
  
  get players(): Array<Player> {return Object.assign({}, this._players);}
  
  
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
        status: player.status,
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
    this.active = true;
    this._players = [];
    this._haveStarted = false;
    this._eventEmitter = eventEmitter;
    eventEmitter.on('update-user-status', (username: string, status: ConnectionStatus): void => {
      if (this.active) {
        const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
        if (player) {
          player.status = status;
          eventEmitter.emit('update', this.id);
        }
      }
    });
  }
}




class Player {
  username: string;
  inventory: Inventory;
  status: ConnectionStatus;
  
  
  constructor(username: string) {
    this.username = username;
    this.inventory = new Inventory();
    this.status = ConnectionStatus.Green;
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