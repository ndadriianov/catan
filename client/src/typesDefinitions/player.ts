export class Player {
  username: string;
  inventory: Inventory;
  
  constructor(username: string) {
    this.username = username;
    this.inventory = new Inventory();
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