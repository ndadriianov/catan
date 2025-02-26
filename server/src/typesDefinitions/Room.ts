import {EventEmitter} from 'node:events';
import {ConnectionStatus} from './User';
import {Gameboard, Owner} from './Gameboard';
import {Player} from './Player';


export class Room {
  id: number;
  active: boolean;
  private _activePlayer?: Player;
  debutMode: boolean;
  lastNumber: number;
  private _counter: number;
  private _players: Array<Player>;
  private _hasStarted: boolean;
  private _eventEmitter: EventEmitter;
  gameboard?: Gameboard;
  
  
  get players(): Array<Player> {return JSON.parse(JSON.stringify(this._players));}
  
  get playersByLink(): Player[] {return this._players;}
  
  
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
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  
  toJSON() {
    return {
      id: this.id,
      players: this._players.map(player => (player.toJSON())),
      activePlayer: this._activePlayer?.username,
      counter: this._counter,
      lastNumber: this.lastNumber,
      haveStarted: this._hasStarted,
      gameboard: this.gameboard ? this.gameboard.toGSON() : undefined
    };
  }
  
  
  constructor(id: number, eventEmitter: EventEmitter) {
    this.id = id;
    this.active = true; // буду использовать для создания архива незаконченных сессий
    this._activePlayer = undefined;
    this.debutMode = false;
    this._counter = 1;
    this._players = [];
    this._hasStarted = false;
    this._eventEmitter = eventEmitter;
    this.lastNumber = 0;
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
  
  public PREPARE() {
    this._counter = 5;
    this.lastNumber = 5;
    this._players[0].color = Owner.black;
    this._players[1].color = Owner.blue;
    this.start();
    this.gameboard?.PREPARE();
    this.debutMode = false;
  }
  
  
  get hasStarted(): boolean {return this._hasStarted; }
  
  
  get activePlayer(): Player | undefined {return this._activePlayer;}
  
  set activePlayer(player: Player) {
    this._activePlayer = player;
    this._eventEmitter.emit('update', this.id);
  }
  
  
  get counter(): number {return this._counter;}
  
  nextTurn(): void {
    this._counter++;
    if (this.debutMode && this._counter > this._players.length * 2) this.debutMode = false;
  }
  
  // предполагается что при вызове _counter уже инкрементирован
  nextPlayer(): Player {
    if (this._counter <= this._players.length || !this.debutMode) {
      return this._players[(this._counter - 1) % this._players.length];
    } else {
      return this._players[this._players.length * 2 - this._counter];
    }
  }
  
  
  start(): void {
    if (this._hasStarted) return;
    
    this._hasStarted = true;
    this.debutMode = true;
    this.gameboard = new Gameboard();
    
    this._players.forEach((player: Player): void => {
      this._eventEmitter.emit(`room-started-${player.username}`, this);
    });
    this._eventEmitter.emit('update', this.id);
    
    // дебют
    this._activePlayer = this._players[0];
    this._eventEmitter.emit('update', this.id);
  }
}
