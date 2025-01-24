import {Player} from './player.ts';

export class Room {
  id: number;
  players: Player[];
  
  constructor(id: number) {
    this.id = id;
    this.players = [];
  }
}