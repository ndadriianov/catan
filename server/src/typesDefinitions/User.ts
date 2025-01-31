import {Room} from './Room';


export class User {
  username: string;
  password: string;
  activeRoom: Room | null;
  private _isActive: boolean;
  private _timer: NodeJS.Timeout | null = null;
  
  
  get isActive() {return this._isActive}
  
  // если пользователь не восстановил подключение в течение 5 секунд, он удаляется из комнаты
  set isActive(isActive: boolean) {
    if (this._isActive && !isActive) {
      
      this._timer = setTimeout(() => {
        console.log(`user ${this.username} hasn't reconnect in 5 seconds`);
        if (this.activeRoom) {
         this.activeRoom.removePlayer(this.username);
         this.activeRoom = null;
        }
        
      }, 5000);
      
    } else if (!this.isActive && isActive) {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    }
    this._isActive = isActive;
  }
  
  
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.activeRoom = null;
    this._isActive = true;
  }
}




export enum LoginStatus{
  Success,
  Incorrect,
  Duplicate,
}