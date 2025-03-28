import {Coords, Player} from './Player';
import {
  clayPortLocations,
  commonPortLocations,
  forrestPortLocations,
  PortTypes,
  sheepPortLocations,
  stonePortLocations,
  wheatPortLocations
} from './Ports';

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
  private portsBuffer: {port: PortTypes, owner: Owner}[];
  private robberPosition: Coords;
  
  
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
    this.portsBuffer = [];
    this.robberPosition = {x: -1, y: -1};
    
    
    const place = (i: number)=>  {
      const tileId: number = this.getRandomInt(0, tilesCollection.length - 1);
      if (tilesCollection[tileId] === Tile.wasteland) {
        this.numbers[i].push(7);
        this.robberPosition = {y: i, x: this.numbers[i].length - 1};
        
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
  
  
  public PREPARE(): void {
    this.houses[3][4] = {owner: Owner.black, type: houseType.village};
    this.houses[2][3] = {owner: Owner.black, type: houseType.village};
    this.roads[5][2] = Owner.black;
    this.roads[4][3] = Owner.black;
    
    this.houses[3][8] = {owner: Owner.blue, type: houseType.village};
    this.houses[2][7] = {owner: Owner.blue, type: houseType.village};
    this.roads[5][4] = Owner.blue;
    this.roads[4][7] = Owner.blue;
  }
  
  
  public PREPARE2(players: Player[]): void {
    this.PlaceVillage({x: 4, y: 3}, Owner.black);
    this.PlaceVillage({x: 3, y: 2}, Owner.black);
    this.PlaceVillage({x: 1, y: 2}, Owner.black);
    this.ApprovePorts(players);
    this.roads[5][2] = Owner.black;
    this.roads[4][3] = Owner.black;
    this.roads[4][2] = Owner.black;
    this.roads[4][1] = Owner.black;
    
    this.PlaceVillage({x: 8, y: 3}, Owner.blue);
    this.PlaceVillage({x: 7, y: 2}, Owner.blue);
    this.PlaceVillage({x: 8, y: 1}, Owner.blue);
    this.PlaceVillage({x: 10, y: 2}, Owner.blue);
    this.ApprovePorts(players);
    this.roads[5][4] = Owner.blue;
    this.roads[4][7] = Owner.blue;
    this.roads[4][8] = Owner.blue;
    this.roads[3][4] = Owner.blue;
    this.roads[4][9] = Owner.blue;
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
      numbers: this.numbers,
      robberPosition: this.robberPosition
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
    return this.roads[coords.y][coords.x + 1];
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
  
  
  private _HousesAroundTheRoad(coords: Coords): House[] {
    const houses: House[] = [];
    
    // если горизонтальная, то остальное не важно
    if (this._IsRoadHorizontal(coords)) {
      houses.push(this.houses[coords.y / 2][coords.x]);
      houses.push(this.houses[coords.y / 2][coords.x + 1]);
    }
    // если центральная, то сверху и снизу x-координаты одинаковые
    else if (this._IsRoadCentral(coords)) {
      houses.push(this.houses[(coords.y - 1) / 2][coords.x * 2]);
      houses.push(this.houses[(coords.y + 1) / 2][coords.x * 2]);
    }
    // если верхняя, то снизу x-координата больше
    else if (this._IsRoadUpper(coords)) {
      houses.push(this.houses[(coords.y - 1) / 2][coords.x * 2]);
      houses.push(this.houses[(coords.y + 1) / 2][coords.x * 2 + 1]);
    }
    // если нижняя, то сверху x-координата больше
    else {
      houses.push(this.houses[(coords.y - 1) / 2][coords.x * 2 + 1]);
      houses.push(this.houses[(coords.y + 1) / 2][coords.x * 2]);
    }
    return houses;
  }
  
  private _RoadsAroundTheRoad(coords: Coords): Owner[] {
    const roads: Owner[] = [];
    
    if (this._IsRoadHorizontal(coords)) {
      const right = this._RoadRightFromRoad(coords);
      const left = this._RoadLeftFromRoad(coords);
      const up = this._RoadUpFromRoad(coords);
      const down = this._RoadDownFromRoad(coords);
      
      if (right !== null) roads.push(right);
      if (left !== null) roads.push(left);
      if (up !== null) roads.push(up);
      if (down !== null) roads.push(down);
      
    } else {
      const ul = this._RoadUpperLeftFromRoad(coords)
      const ur = this._RoadUpperRightFromRoad(coords)
      const bl = this._RoadBottomLeftFromRoad(coords)
      const br = this._RoadBottomRightFromRoad(coords)
      
      if (ul !== null) roads.push(ul);
      if (ur !== null) roads.push(ur);
      if (bl !== null) roads.push(bl);
      if (br !== null) roads.push(br);
    }
    
    return roads;
  }
  
  
  /*********************************************************************************************************************
   * ВСПОМОГАТЕЛЬНЫЕ ДЛЯ РАЗБОЙНИКА
   *********************************************************************************************************************/
  
  private _isHexCoordsValid(coords: Coords): boolean {
    return coords.y >= 0 && coords.y < this.numbers.length && coords.x >= 0 && coords.x < this.numbers[coords.y].length;
  }
  
  private _isHexUpper(coords: Coords): boolean {
    return coords.y < 2;
  }
  
  private _isHexCentral(coords: Coords): boolean {
    return coords.y === 2;
  }
  
  private _isHexBottom(coords: Coords): boolean {
    return coords.y > 2;
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
  
  private _RoadsAroundTheHouse(coords: Coords): Owner[] {
    const roads: Owner[] = [];
    if (coords.x > 0) roads.push(this.roads[coords.y * 2][coords.x - 1]);
    if (coords.x < this.houses[coords.y].length - 1) roads.push(this.roads[coords.y * 2][coords.x]);
    
    if (this._IsHouseUpper(coords)) {
      if (this._IsHouseUpperCase(coords)) {
        if (coords.y > 0) roads.push(this.roads[coords.y * 2 - 1][(coords.x - 1) / 2]);
      } else {
        roads.push(this.roads[coords.y * 2 + 1][coords.x / 2]);
      }
    } else {
      if (this._IsHouseUpperCase(coords)) {
        roads.push(this.roads[coords.y * 2 - 1][coords.x / 2]);
      } else {
        if (coords.y < this.houses.length - 1) roads.push(this.roads[coords.y * 2 + 1][(coords.x - 1) / 2]);
      }
    }
    return roads;
  }
  
  
  private _CheckPort(coords: Coords): PortTypes {
    if (commonPortLocations.find(c => c.x === coords.x && c.y === coords.y)) return PortTypes.common;
    if (clayPortLocations.find(c => c.x === coords.x && c.y === coords.y)) return PortTypes.clay;
    if (forrestPortLocations.find(c => c.x === coords.x && c.y === coords.y)) return PortTypes.forrest;
    if (sheepPortLocations.find(c => c.x === coords.x && c.y === coords.y)) return PortTypes.sheep;
    if (stonePortLocations.find(c => c.x === coords.x && c.y === coords.y)) return PortTypes.stone;
    if (wheatPortLocations.find(c => c.x === coords.x && c.y === coords.y)) return PortTypes.wheat;
    return PortTypes.noPort;
  }
  
  
  
  /*********************************************************************************************************************
   * ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ СОСЕДНИХ ЭЛЕМЕНТОВ КАРТЫ
   *********************************************************************************************************************/
  
  CheckRoad(coords: Coords, owner: Owner): boolean {
    if (!this._IsRoadCoordsValid(coords)) return false;
    if (this.roads[coords.y][coords.x] !== Owner.nobody) return false;
    
    const neighbourRoads: Owner[] = this._RoadsAroundTheRoad(coords);
    const neighbourHouses: House[] = this._HousesAroundTheRoad(coords);
    
    return (!!neighbourRoads.find((road: Owner): boolean => road === owner)
      || !!neighbourHouses.find((house: House): boolean => house.owner === owner));
  }
  
  
  DebutCheckVillage(coords: Coords, owner: Owner): boolean {
    if (!this._IsHouseCoordsValid(coords)) return false;
    if (this.houses[coords.y][coords.x].owner !== Owner.nobody) return false;
    
    return !this._HousesAroundTheHouse(coords).find((house: House): boolean => house.owner !== Owner.nobody);
  }
  
  
  CheckVillage(coords: Coords, owner: Owner): boolean {
    if (!this._IsHouseCoordsValid(coords)) return false;
    if (this.houses[coords.y][coords.x].owner !== Owner.nobody) return false;
    
    const neighbourRoads: Owner[] = this._RoadsAroundTheHouse(coords);
    const neighbourHouses: House[] = this._HousesAroundTheHouse(coords);
    
    return (!!neighbourRoads.find((road: Owner): boolean => road === owner)
      && !neighbourHouses.find((house: House): boolean => house.owner !== Owner.nobody));
  }
  
  
  CheckCity(coords: Coords, owner: Owner): boolean {
    if (!this._IsHouseCoordsValid(coords)) return false;
    if (this.houses[coords.y][coords.x].owner !== owner) return false;
    
    return this.houses[coords.y][coords.x].type == houseType.village;
  }
  
  
  /*********************************************************************************************************************
   * ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ДОБАВЛЕНИЯ ОБЪЕКТА
   *********************************************************************************************************************/
  
  
  PlaceVillage(coords: Coords, owner: Owner): void {
    this.undoVillages.push(coords);
    this.houses[coords.y][coords.x] = {owner: owner, type: houseType.village};
    const port = this._CheckPort(coords);
    if (port !== PortTypes.noPort) this.portsBuffer.push({port: port, owner: owner});
  }
  
  PlaceCity(coords: Coords, owner: Owner): void {
    this.undoCities.push(coords);
    this.houses[coords.y][coords.x] = {owner: owner, type: houseType.city};
  }
  
  PlaceRoad(coords: Coords, owner: Owner): void {
    this.undoRoads.push(coords);
    this.roads[coords.y][coords.x] = owner;
  }
  
  ApprovePorts(players: Player[]): void {
    this.portsBuffer.forEach(p => {
      const player = players.find(pl => pl.color === p.owner);
      if (player) player.ports.push(p.port);
    })
    this.portsBuffer = [];
  }
  
  
  MoveRobber(coords: Coords): boolean {
    if (coords.y >= 0 && coords.y < this.numbers.length && coords.x >= 0 && coords.x < this.numbers[coords.y].length) {
      this.robberPosition = coords;
      return true;
    }
    return false;
  }
  
  public PlayersAtRobbersPosition(players: Player[]): string[] {
    /*
    по вертикали нужны дома y и y + 1
    
    в верхней половине:
      сверху:
        x * 2, x * 2 + 1, x * 2 + 2
      снизу:
        x * 2 + 1, x * 2 + 2, x * 2 + 3
    
    в нижней половине наоборот
    */
    
    const coords = this.robberPosition;
    if (!this._isHexCoordsValid(coords)) return [];
    
    const owners: Owner[] = [];
    if (this._isHexUpper(coords)) {
      owners.push(this.houses[coords.y][coords.x * 2].owner);
      owners.push(this.houses[coords.y + 1][coords.x * 2 + 3].owner);
      
    } else if (this._isHexCentral(coords)) {
      owners.push(this.houses[coords.y][coords.x * 2].owner);
      owners.push(this.houses[coords.y + 1][coords.x * 2].owner);
      
    } else {
      owners.push(this.houses[coords.y][coords.x * 2 + 3].owner);
      owners.push(this.houses[coords.y + 1][coords.x * 2].owner);
    }
    owners.push(this.houses[coords.y][coords.x * 2 + 1].owner);
    owners.push(this.houses[coords.y][coords.x * 2 + 2].owner);
    owners.push(this.houses[coords.y + 1][coords.x * 2 + 1].owner);
    owners.push(this.houses[coords.y + 1][coords.x * 2 + 2].owner);
    
    return [...new Set(owners)].map(color => {
      const player = players.find(p => p.color === color);
      return player ? player.username : '';
    }).filter(a => a !== '');
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
    this.portsBuffer = [];
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
