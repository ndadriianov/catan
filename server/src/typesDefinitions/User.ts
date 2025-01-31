import {Room} from './Room';


export class User {
  username: string;
  password: string;
  activeRoom: Room | null;
  private _status: ConnectionStatus;
  private _timer: NodeJS.Timeout | null = null;
  
  
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
  
  
  get status(): ConnectionStatus {return this._status}
  
  // если пользователь не восстановил подключение в течение 5 секунд, он удаляется из комнаты
  set status(status: ConnectionStatus) {
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
    } else if (status === ConnectionStatus.Green && this._status === ConnectionStatus.Red) {
      this._status = ConnectionStatus.Green;
      // обработка выхода из аккаунта (БОЛЬШЕ НИГДЕ НЕ ИСПОЛЬЗОВАТЬ!!!)
    } else if (status === ConnectionStatus.Red) {
      this._disconnect();
    }
  }
  
  
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.activeRoom = null;
    this._status = ConnectionStatus.Green;
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