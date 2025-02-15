import {EventEmitter} from 'node:events';
import {ConnectionStatus} from './User';
import {Gameboard, Owner} from './Gameboard';
import {Player} from './Player';


export class Room {
  id: number;
  active: boolean;
  private _players: Array<Player>;
  private _hasStarted: boolean;
  private _eventEmitter: EventEmitter;
  gameboard?: Gameboard;
  
  
  get players(): Array<Player> {return JSON.parse(JSON.stringify(this._players));}
  
  
  isInRoom(username: string): boolean {
    const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
    return !!player;
  }
  
  
  // если игра не началась, то пользователь будет добавлен при наличии места
  // если игра началась, то ничего не произойдет
  addPlayer(username: string): boolean {
    if (this._hasStarted || this._players.length === 4) return false;
    if (this._players.find((player: Player): boolean => player.username === username)) return false;
    
    this._players.push(new Player(username));
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  // если игра не началась, то пользователь просто будет удален
  // если игра началась, то ничего не произойдет
  removePlayer(username: string): boolean {
    if (this._hasStarted) return false;
    if (!this._players.find((player: Player): boolean => player.username === username)) return false;
    
    this._players = this._players.filter((player: Player): boolean => player.username !== username);
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  setColor(color: Owner, username: string): boolean {
    const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
    if (!player) return false;
    player.color = color;
    return true;
  }
  
  
  toJSON() {
    return {
      id: this.id,
      players: this._players.map(player => ({
        username: player.username,
        status: player.status,
        leftTheRoom: player.leftTheRoom,
        inventory: {
          clay: player.inventory.clay,
          forrest: player.inventory.forrest,
          sheep: player.inventory.sheep,
          stone: player.inventory.stone,
          wheat: player.inventory.wheat,
        }
      })),
      haveStarted: this._hasStarted,
      gameboard: this.gameboard ? this.gameboard.toGSON() : undefined
    };
  }
  
  
  constructor(id: number, eventEmitter: EventEmitter) {
    this.id = id;
    this.active = true; // буду использовать для создания архива незаконченных сессий
    this._players = [];
    this._hasStarted = false;
    this._eventEmitter = eventEmitter;
    eventEmitter.on('update-user-status', (username: string, status: ConnectionStatus): void => { // надо сделать чтобы получала только та комната где есть данный игрок
      const player: Player | undefined = this._players.find((player: Player): boolean => player.username === username);
      if (player) {
        player.status = status;
        eventEmitter.emit('update', this.id);
      }
    });
    eventEmitter.on(`player-connected-to-room-${this.id}`, (username: string): void => {
      const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
      if (player) {
        player.leftTheRoom = false;
        eventEmitter.emit('update', this.id);
      }
    });
    eventEmitter.on(`player-disconnected-from-room-${this.id}`, (username: string): void => {
      const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
      if (player) {
        player.leftTheRoom = true;
        eventEmitter.emit('update', this.id);
      }
    });
  }
  
  
  
  get hasStarted(): boolean {return this._hasStarted; }
  
  
  start(): void {
    if (this._hasStarted) return;
    
    this._hasStarted = true;
    this.gameboard = new Gameboard();
    
    this._players.forEach((player: Player): void => {
      this._eventEmitter.emit(`room-started-${player.username}`, this);
    });
    this._eventEmitter.emit('update', this.id);
    
    // дебют
    this._players.forEach((player: Player): void => {
      this._eventEmitter.emit(`${player.username}:debut-turn`, this, player.color);
    })
  }
}
