import {Player} from './player.ts';

export class Room {
  id: number;
  players: Player[];
  haveStarted: boolean;
  
  constructor(id: number) {
    this.id = id;
    this.players = [];
    this.haveStarted = false;
  }
}