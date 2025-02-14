export enum Tile {
  forrest,    //4
  wheat,      //4
  sheep,      //4
  clay,       //3
  stone,      //3
  wasteland   //1
}

export enum Owner {
  nobody,
  black,
  blue,
  green,
  orange
}

export enum houseType {
  village,
  city
}


export type House = {
  owner: Owner;
  type: houseType
}


export class Gameboard {
  tiles: Tile[][];
  houses: House[][];
  roads: Owner[][];
  numbers: number[][];
  
  
  constructor() {
    const tilesCollection: Tile[] = [
      Tile.forrest, Tile.forrest, Tile.forrest, Tile.forrest,
      Tile.wheat, Tile.wheat, Tile.wheat, Tile.wheat,
      Tile.sheep, Tile.sheep, Tile.sheep, Tile.sheep,
      Tile.clay, Tile.clay, Tile.clay,
      Tile.stone, Tile.stone, Tile.stone,
      Tile.wasteland
    ];
    const numbersCollection: number[] = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
    
    this.tiles = [[], [], [], [], []];
    this.numbers = [[], [], [], [], []];
    
    
    const place = (i: number)=>  {
      const tileId: number = this.getRandomInt(0, tilesCollection.length - 1);
      if (tilesCollection[tileId] === Tile.wasteland) {
        this.numbers[i].push(7);
        
      } else {
        const numberId: number = this.getRandomInt(0, numbersCollection.length - 1);
        this.numbers[i].push(numbersCollection[numberId]);
        numbersCollection.splice(numberId, 1);
      }
      this.tiles[i].push(tilesCollection[tileId]);
      tilesCollection.splice(tileId, 1);
    }
    
    for (let i = 0; i < 3; i++) place(0);
    for (let i = 0; i < 4; i++) place(1);
    for (let i = 0; i < 5; i++) place(2);
    for (let i = 0; i < 4; i++) place(3);
    for (let i = 0; i < 3; i++) place(4);
    
    
    this.houses = [
      new Array(7).fill({owner: Owner.nobody, type: houseType}),
      new Array(9).fill({owner: Owner.nobody, type: houseType}),
      new Array(11).fill({owner: Owner.nobody, type: houseType}),
      new Array(11).fill({owner: Owner.nobody, type: houseType}),
      new Array(9).fill({owner: Owner.nobody, type: houseType}),
      new Array(7).fill({owner: Owner.nobody, type: houseType}),
    ];
    
    this.roads = [
      new Array(6).fill(Owner.nobody),
      new Array(4).fill(Owner.nobody),
      new Array(8).fill(Owner.nobody),
      new Array(5).fill(Owner.nobody),
      new Array(10).fill(Owner.nobody),
      new Array(6).fill(Owner.nobody),
      new Array(10).fill(Owner.nobody),
      new Array(5).fill(Owner.nobody),
      new Array(8).fill(Owner.nobody),
      new Array(4).fill(Owner.nobody),
      new Array(6).fill(Owner.nobody),
    ]
  }
  
  
  private _Coords(pos: number): {x: number, y: number} {
    if (pos <= 3) return {x: 1, y: pos};
    if (pos <= 7) return {x: 2, y: pos - 3};
    if (pos <= 12) return {x: 3, y: pos - 7};
    if (pos <= 16) return {x: 4, y: pos - 12};
    return {x: 5, y: pos - 16};
  }
  
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  toGSON() {
    return {
      tiles: this.tiles,
      houses: this.houses,
      roads: this.roads,
      numbers: this.numbers
    };
  }
}