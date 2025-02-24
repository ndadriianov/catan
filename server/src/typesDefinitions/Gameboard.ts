import {Coords, Player} from './Player';
import * as punycode from 'node:punycode';

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
  private undoRoads: Coords[];
  private undoCities: Coords[];
  private undoVillages: Coords[];
  
  
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
    
    this.undoRoads = [];
    this.undoVillages = [];
    this.undoCities = [];
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
    // если горизонтальная, то остальное не важно
    if (this._IsRoadHorizontal(coords)) return {
      first: this.houses[coords.y / 2][coords.x],
      second: this.houses[coords.y / 2][coords.x + 1]
    };
    // если центральная, то сверху и снизу x-координаты одинаковые
    if (this._IsRoadCentral(coords)) return {
      first: this.houses[(coords.y - 1) / 2][coords.x * 2],
      second: this.houses[(coords.y + 1) / 2][coords.x * 2]
    };
    // если верхняя, то снизу x-координата больше
    if (this._IsRoadUpper(coords)) return {
      first: this.houses[(coords.y - 1) / 2][coords.x * 2],
      second: this.houses[(coords.y + 1) / 2][coords.x * 2 + 1]
    };
    // если нижняя, то сверху x-координата больше
    return {
      first: this.houses[(coords.y - 1) / 2][coords.x * 2 + 1],
      second: this.houses[(coords.y + 1) / 2][coords.x * 2]
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
    
    console.log(this._HousesAroundTheRoad(coords));
    
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
  
  
  /*********************************************************************************************************************
   * ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ДОБАВЛЕНИЯ ОБЪЕКТА
   *********************************************************************************************************************/
  
  PlaceVillage(coords: Coords, owner: Owner): void {
    this.undoVillages.push(coords);
    this.houses[coords.y][coords.x] = {owner: owner, type: houseType.village};
  }
  
  PlaceRoad(coords: Coords, owner: Owner): void {
    this.undoRoads.push(coords);
    this.roads[coords.y][coords.x] = owner;
  }
  
  
  Undo(): void {
    this.undoRoads.forEach((coords: Coords): void => {
      this.roads[coords.y][coords.x] = Owner.nobody;
    });
    this.undoCities.forEach((coords: Coords): void => {
      this.houses[coords.y][coords.x] = {...this.houses[coords.y][coords.x], type: houseType.village};
    })
    this.undoVillages.forEach((coords: Coords): void => {
      this.houses[coords.y][coords.x] = {owner: Owner.nobody, type: houseType.village};
    });
    
    this.ClearUndo();
  }
  
  public ClearUndo(): void {
    this.undoRoads = [];
    this.undoCities = [];
    this.undoVillages = [];
  }
  
  
  /*********************************************************************************************************************
   * МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ РЕСУРСОВ
   *********************************************************************************************************************/
  
  private ThrowDice(): number {
    return this.getRandomInt(1, 6) + this.getRandomInt(1, 6);
  }
  
  private _HousesAroundTheTile(coords: Coords): House[] {
    const result: House[] = [];
    const xBase: number = coords.x * 2;
    const yBase: number = coords.y;
    
    // central
    if (coords.y === 2) {
      result.push(this.houses[yBase][xBase]);
      result.push(this.houses[yBase][xBase + 1]);
      result.push(this.houses[yBase][xBase + 2]);
      result.push(this.houses[yBase + 1][xBase]);
      result.push(this.houses[yBase + 1][xBase + 1]);
      result.push(this.houses[yBase + 1][xBase + 2]);
    }
    // upper
    else if (coords.y < 2) {
      result.push(this.houses[yBase][xBase]);
      result.push(this.houses[yBase][xBase + 1]);
      result.push(this.houses[yBase][xBase + 2]);
      result.push(this.houses[yBase + 1][xBase + 1]);
      result.push(this.houses[yBase + 1][xBase + 2]);
      result.push(this.houses[yBase + 1][xBase + 3]);
    }
    // lower
    else {
      result.push(this.houses[yBase][xBase + 1]);
      result.push(this.houses[yBase][xBase + 2]);
      result.push(this.houses[yBase][xBase + 3]);
      result.push(this.houses[yBase + 1][xBase]);
      result.push(this.houses[yBase + 1][xBase + 1]);
      result.push(this.houses[yBase + 1][xBase + 2]);
    }
    return result;
  }
  
  public GiveResources(players: Player[]): number {
    const roll: number = this.ThrowDice();
    if (roll === 7) console.log('разбойник');
    this.numbers.forEach((nums: number[], yIndex: number): void => {
      nums.forEach((num: number, xIndex: number): void => {
        if (num === roll) {
          const resource: Tile = this.tiles[yIndex][xIndex];
          const houses: House[] = this._HousesAroundTheTile({x: xIndex, y: yIndex});
          houses.forEach(house => {
            if (house.owner !== Owner.nobody) {
              const currentPlayer: Player|undefined = players.find(player => player.color === house.owner);
              if (currentPlayer) {
                switch (resource) {
                  case Tile.forrest: currentPlayer.inventory.forrest += house.type === houseType.village ? 1 : 2; break;
                  case Tile.wheat: currentPlayer.inventory.wheat += house.type === houseType.village ? 1 : 2; break;
                  case Tile.sheep: currentPlayer.inventory.sheep += house.type === houseType.village ? 1 : 2; break;
                  case Tile.clay: currentPlayer.inventory.clay += house.type === houseType.village ? 1 : 2; break;
                  case Tile.stone: currentPlayer.inventory.stone += house.type === houseType.village ? 1 : 2; break;
                }
              }
            }
          });
        }
      });
    });
    return roll;
  }
}
