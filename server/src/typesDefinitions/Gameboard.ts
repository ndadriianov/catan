import {Coords} from './Player';

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
  private tiles: Tile[][];
  private houses: House[][];
  private roads: Owner[][];
  private numbers: number[][];
  
  
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
  
  
  
  /*********************************************************************************************************************
   * ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ СОСЕДНИХ ЭЛЕМЕНТОВ КАРТЫ
   *********************************************************************************************************************/
  
  /*********************************************************************************************************************
   * ДОРОГИ
   *********************************************************************************************************************/
  
  private _IsRoadCoordsValid(coords: Coords): boolean {
    if (coords.y < 0 || coords.y > this.roads.length) return false;
    if (coords.x < 0 || coords.x > this.roads[coords.y].length) return false;
    return true;
  }
  
  private _IsRoadHorizontal(coords: Coords): boolean {
    return coords.y % 2 === 0;
  }
  
  // лево/право определяется относительно тайла, для относительно которого дорога находится в его верхней части
  private _IsRoadLeft(coords: Coords): boolean {
    if (this._IsRoadUpper(coords)) {
      return coords.x % 2 === 0;
    } else {
      return coords.x % 2 === 1;
    }
  }
  
  // имеется ввиду она в верхней или нижней части карты
  private _IsRoadUpper(coords: Coords): boolean {
    return coords.y <= 4;
  }
  
  // вертикальные дороги между самым длинным рядом тайлов
  private _IsRoadCentral(coords: Coords): boolean {
    return coords.y === 5;
  }
  
  private _IsRoadBottom(coords: Coords): boolean {
    return coords.y >= 6;
  }
  
  
  // соседние дороги для горизонтальных
  
  private _RoadLeftFromRoad(coords: Coords): Owner | null {
    if (coords.x === 0) return null;
    return this.roads[coords.y][coords.x - 1];
  }
  
  private _RoadRightFromRoad(coords: Coords): Owner | null {
    if (coords.x === this.roads[coords.y].length - 1) return null;
    return this.roads[coords.y][coords.x - 1];
  }
  
  private _RoadUpFromRoad(coords: Coords): Owner | null {
    if (coords.y === 0) return null;
    
    if (this._IsRoadUpper(coords)) {
      if (this._IsRoadLeft(coords)) {
        return this.roads[coords.y - 1][coords.x / 2];
      } else {
        return this.roads[coords.y - 1][(coords.x - 1) / 2];
      }
    } else {
      if (this._IsRoadLeft(coords)) {
        return this.roads[coords.y - 1][(coords.x + 1) / 2];
      } else {
        return this.roads[coords.y - 1][coords.x / 2];
      }
    }
  }
  
  private _RoadDownFromRoad(coords: Coords): Owner | null {
    if (coords.y === this.roads.length - 1) return null;
    
    if (this._IsRoadUpper(coords)) {
      if (this._IsRoadLeft(coords)) {
        return this.roads[coords.y + 1][coords.x / 2];
      } else {
        return this.roads[coords.y + 1][(coords.x + 1) / 2];
      }
    } else {
      if (this._IsRoadLeft(coords)) {
        return this.roads[coords.y + 1][(coords.x - 1) / 2];
      } else {
        return this.roads[coords.y + 1][coords.x / 2];
      }
    }
  }
  
  
  // соседние дороги для вертикальных
  
  private _RoadUpperLeftFromRoad(coords: Coords): Owner | null {
    if (coords.x === 0 && this._IsRoadBottom(coords)) return null;
    
    if (this._IsRoadCentral(coords) || this._IsRoadUpper(coords)) {
      return this.roads[coords.y - 1][coords.x * 2 - 1];
    } else {
      return this.roads[coords.y - 1][coords.x * 2];
    }
  }
  
  private _RoadUpperRightFromRoad(coords: Coords): Owner | null {
    if (coords.x === this.roads[coords.y].length - 1 && this._IsRoadBottom(coords)) return null;
    
    if (this._IsRoadCentral(coords) || this._IsRoadUpper(coords)) {
      return this.roads[coords.y - 1][coords.x * 2];
    } else {
      return this.roads[coords.y - 1][coords.x * 2 + 1];
    }
  }
  
  private _RoadBottomLeftFromRoad(coords: Coords): Owner | null {
    if (coords.x === 0 && !this._IsRoadUpper(coords)) return null;
    
    if (this._IsRoadCentral(coords) || !this._IsRoadUpper(coords)) {
      return this.roads[coords.y + 1][coords.x * 2 - 1];
    } else {
      return this.roads[coords.y + 1][coords.x * 2];
    }
  }
  
  private _RoadBottomRightFromRoad(coords: Coords): Owner | null {
    if (coords.x === this.roads[coords.y].length - 1 && !this._IsRoadUpper(coords)) return null;
    
    if (this._IsRoadCentral(coords) || !this._IsRoadUpper(coords)) {
      return this.roads[coords.y + 1][coords.x * 2];
    } else {
      return this.roads[coords.y + 1][coords.x * 2 + 1];
    }
  }
  
  
  private _HousesAroundTheRoad(coords: Coords): {first: House, second: House} {
    if (this._IsRoadHorizontal(coords)) return {
      first: this.houses[coords.y][coords.x],
      second: this.houses[coords.y][coords.x + 1]
    };
    if (this._IsRoadCentral(coords)) return {
      first: this.houses[coords.y - 1][coords.x * 2],
      second: this.houses[coords.y + 1][coords.x * 2]
    };
    if (this._IsRoadUpper(coords)) return {
      first: this.houses[coords.y - 1][coords.x * 2],
      second: this.houses[coords.y - 1][coords.x * 2 + 1]
    };
    return {
      first: this.houses[coords.y - 1][coords.x * 2 + 1],
      second: this.houses[coords.y - 1][coords.x * 2]
    };
  }
  
  
  /*********************************************************************************************************************
   * ПОСЕЛЕНИЯ
   *********************************************************************************************************************/
  
  private _IsHouseCoordsValid(coords: Coords): boolean {
    if (coords.y < 0 || coords.y > this.houses.length) return false;
    if (coords.x < 0 || coords.x > this.houses[coords.y].length) return false;
    return true;
  }
  
  // имеется ввиду выше ли он середины карты
  private _IsHouseUpper(coords: Coords): boolean {
    return coords.y <= 2;
  }
  
  private _IsHouseCentral(coords: Coords): boolean {
    return coords.y === 2 || coords.y === 3;
  }
  
  private _IsHouseUpperCase(coords: Coords): boolean {
    return this._IsHouseUpper(coords) ? coords.x % 2 === 1 : coords.y % 2 === 0;
  }
  
  private _HousesAroundTheHouse(coords: Coords): House[] {
    const houses: House[] = [];
    if (coords.x > 0) houses.push(this.houses[coords.y][coords.x - 1]);
    if (coords.x < this.houses[coords.y].length - 1) houses.push(this.houses[coords.y][coords.x + 1]);
    
    if (this._IsHouseUpper(coords)) {
      if (this._IsHouseUpperCase(coords)) {
        if (coords.y > 0) houses.push(this.houses[coords.y - 1][coords.x - 1]);
      } else if (this._IsHouseCentral(coords)) {
        houses.push(this.houses[coords.y + 1][coords.x]);
      } else {
        houses.push(this.houses[coords.y + 1][coords.x + 1]);
      }
    } else {
      if (!this._IsHouseUpperCase(coords)) {
        if (coords.y < houses.length - 1) houses.push(this.houses[coords.y + 1][coords.x - 1]);
      } else if (this._IsHouseCentral(coords)) {
        houses.push(this.houses[coords.y - 1][coords.x]);
      } else {
        houses.push(this.houses[coords.y - 1][coords.x + 1]);
      }
    }
    return houses;
  }
  
  
  
  /*********************************************************************************************************************
   * ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ СОСЕДНИХ ЭЛЕМЕНТОВ КАРТЫ
   *********************************************************************************************************************/
  
  CheckRoad(coords: Coords, owner: Owner): boolean {
    if (!this._IsRoadCoordsValid(coords)) return false;
    if (this.roads[coords.y][coords.x] !== Owner.nobody) return false;
    
    if (this._IsRoadHorizontal(coords)) return (
      this._RoadLeftFromRoad(coords) === owner
      || this._RoadRightFromRoad(coords) === owner
      || this._RoadUpFromRoad(coords) === owner
      || this._RoadDownFromRoad(coords) === owner
      || this._HousesAroundTheRoad(coords).first.owner === owner
      || this._HousesAroundTheRoad(coords).second.owner === owner
    )
    
    return (
      this._RoadUpperLeftFromRoad(coords) === owner
      || this._RoadUpperRightFromRoad(coords) === owner
      || this._RoadBottomLeftFromRoad(coords) === owner
      || this._RoadBottomRightFromRoad(coords) === owner
      || this._HousesAroundTheRoad(coords).first.owner === owner
      || this._HousesAroundTheRoad(coords).second.owner === owner
    )
  }
  
  
  DebutCheckVillage(coords: Coords, owner: Owner): boolean {
    if (!this._IsHouseCoordsValid(coords)) return false;
    if (this.houses[coords.y][coords.x].owner !== Owner.nobody) return false;
    
    return !this._HousesAroundTheHouse(coords).find((house: House): boolean => house.owner !== Owner.nobody);
  }
  
  // CheckVillage
}