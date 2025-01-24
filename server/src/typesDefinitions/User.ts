import {Room} from './Room';

export class User {
  username: string;
  password: string;
  activeRoom: Room | null;
  
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.activeRoom = null;
  }
}