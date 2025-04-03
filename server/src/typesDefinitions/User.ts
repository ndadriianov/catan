import {Room} from './Room';
import {EventEmitter} from 'node:events';
import {saveUser} from '../InteractionWithDB';


export class User {
  username: string;
  password: string;
  participatingRooms: Room[];
  private _activeRoom: Room | null;
  private _status: ConnectionStatus;
  private _timer: NodeJS.Timeout | null = null;
  private _eventEmitter: EventEmitter;
  
  
  private _clearTimer(): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  private _disconnect(): void {
    this._status = ConnectionStatus.Red;
    if (this._activeRoom) {
      this._activeRoom.removePlayer(this.username);
      this._activeRoom = null;
      this._eventEmitter.removeAllListeners(`${this.username}:debut-turn`);
    }
  }
  
  
  get status(): ConnectionStatus {return this._status}
  
  // если пользователь не восстановил подключение в течение 5 секунд, он удаляется из комнаты
  set status(status: ConnectionStatus) {
    const oldStatus: ConnectionStatus = Object.assign({}, status);
    
    // обработка разрыва соединения
    if (status === ConnectionStatus.Yellow && this._status !== ConnectionStatus.Red) {
      this._status = ConnectionStatus.Yellow;
      this._clearTimer();
      
      this._timer = setTimeout((): void => {
        console.log(`user ${this.username} hasn't reconnect in 5 seconds`);
        this._disconnect();
      }, 5000)
      
      // обработка восстановления соединения
    } else if (status === ConnectionStatus.Green && this._status === ConnectionStatus.Yellow) {
      this._status = ConnectionStatus.Green;
      this._clearTimer();
      // обработка подключения после долгой паузы
    } else if (status === ConnectionStatus.Green && this._status === ConnectionStatus.Red) {/////////////////
      this._status = ConnectionStatus.Green;
      // обработка выхода из аккаунта (БОЛЬШЕ НИГДЕ НЕ ИСПОЛЬЗОВАТЬ!!!)
    } else if (status === ConnectionStatus.Red) {
      this._disconnect(); // комната обновляется внутри функции
    }
    
    // обновление для комнат
    if (this._status !== oldStatus) this._eventEmitter.emit('update-user-status', this.username, this._status);
  }
  
  
  get activeRoom(): Room|null {return this._activeRoom;}
  
  set activeRoom(activeRoom: Room|null) {
    if (!this._activeRoom) {
      if (activeRoom) {
        this._activeRoom = activeRoom;
        this._eventEmitter.emit(`player-connected-to-room-${this._activeRoom.id}}`, this.username);
      }
    } else {
      this._eventEmitter.emit(`player-disconnected-from-room-${this._activeRoom.id}`, this.username);
      if (activeRoom) {
        this._activeRoom = activeRoom;
        this._eventEmitter.emit(`player-connected-to-room-${this._activeRoom.id}`, this.username);
      }
    }
  }
  
  
  constructor(username: string, password: string, emitter: EventEmitter, participatingRooms?: Room[]) {
    this.username = username;
    this.password = password;
    if (participatingRooms) this.participatingRooms = participatingRooms;
    else this.participatingRooms = [];
    this._activeRoom = null;
    this._status = ConnectionStatus.Red;
    this._eventEmitter = emitter;
    
    emitter.on(`room-started-${this.username}`, async (room: Room): Promise<void> => {
      this.participatingRooms.push(room);
      await saveUser(this);
    });
  }
}




export enum ConnectionStatus {
  Red,
  Yellow,
  Green
}


export enum LoginStatus{
  Success,
  Incorrect,
  Duplicate
}