import {Room} from './Room';
import {EventEmitter} from 'node:events';


export class User {
  username: string;
  password: string;
  activeRoom: Room | null;
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
    if (this.activeRoom) {
      this.activeRoom.removePlayer(this.username);
      this.activeRoom = null;
    }
  }
  
  
  get status(): ConnectionStatus {return Object.assign({}, this._status);}
  
  // если пользователь не восстановил подключение в течение 5 секунд, он удаляется из комнаты
  set status(status: ConnectionStatus) {
    // обработка разрыва соединения
    if (status === ConnectionStatus.Yellow && this._status !== ConnectionStatus.Red) {
      if (this._status === ConnectionStatus.Green) {
        this._status = ConnectionStatus.Yellow;
        if (this.activeRoom) this._eventEmitter.emit('update-user-status', this.username, this._status); // для обновления в комнате
      }
      this._clearTimer();
      
      this._timer = setTimeout((): void => {
        console.log(`user ${this.username} hasn't reconnect in 5 seconds`);
        this._disconnect();
      }, 5000)
      
      // обработка восстановления соединения
    } else if (status === ConnectionStatus.Green && this._status === ConnectionStatus.Yellow) {
      this._status = ConnectionStatus.Green;
      if (this.activeRoom) this._eventEmitter.emit('update-user-status', this.username, this._status); // для обновления в комнате
      this._clearTimer();
      // обработка подключения после долгой паузы
    } else if (status === ConnectionStatus.Green && this._status === ConnectionStatus.Red) {
      this._status = ConnectionStatus.Green;
      // обработка выхода из аккаунта (БОЛЬШЕ НИГДЕ НЕ ИСПОЛЬЗОВАТЬ!!!)
    } else if (status === ConnectionStatus.Red) {
      this._disconnect();
    }
  }
  
  
  constructor(username: string, password: string, emitter: EventEmitter) {
    this.username = username;
    this.password = password;
    this.activeRoom = null;
    this._status = ConnectionStatus.Green;
    this._eventEmitter = emitter;
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