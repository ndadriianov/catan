import {Tile, tiles} from '../../../../typesDefinitions/tiles.ts';
import {leftRoads, rightRoads, Road, straightRoads} from '../../../../typesDefinitions/roads.ts';
import {cities, House, villages} from '../../../../typesDefinitions/houses.ts';
import tile from '../../../../typesDefinitions/room/tile.ts';
import Owner from '../../../../typesDefinitions/owner.ts';
import house from '../../../../typesDefinitions/house/house.ts';
import houseType from '../../../../typesDefinitions/house/houseType.ts';

export function getTiles(enumTiles: tile[][]): Tile[][] {
  const realTiles: Tile[][] = [[], [], [], [], []];
  
  for (let i = 0; i < enumTiles.length; i++) {
    enumTiles[i].forEach((currentTile: tile): void => {
      switch (currentTile) {
        case tile.forrest: realTiles[i].push(tiles.forrest); break;
        case tile.wheat: realTiles[i].push(tiles.wheat); break;
        case tile.sheep: realTiles[i].push(tiles.sheep); break;
        case tile.clay: realTiles[i].push(tiles.clay); break;
        case tile.stone: realTiles[i].push(tiles.stone); break;
        default: realTiles[i].push(tiles.wasteland); break;
      }
    });
  }
  return realTiles;
}


export function getRoads(enumRoads: Owner[][]): Road[][] {
  const realRoads: Road[][] = [[], [], [], [], [], [], [], [], [], [], []];
  
  for (let i = 0; i < enumRoads.length; i++) {
    enumRoads[i].forEach((currentRoad: Owner, index: number): void => {
      const isTurned: boolean = i % 2 === 0;
      const isRight: boolean = isTurned && ((i < 6 && index % 2 === 0) || (i >= 6 && index % 2 === 1));
      
      switch (currentRoad) {
        case Owner.black: realRoads[i].push(isTurned ? isRight ? rightRoads.black : leftRoads.black : straightRoads.black); break;
        case Owner.blue: realRoads[i].push(isTurned ? isRight ? rightRoads.blue : leftRoads.blue : straightRoads.blue); break;
        case Owner.green: realRoads[i].push(isTurned ? isRight ? rightRoads.green : leftRoads.green : straightRoads.green); break;
        case Owner.orange: realRoads[i].push(isTurned ? isRight ? rightRoads.orange : leftRoads.orange : straightRoads.orange); break;
        default: realRoads[i].push(isTurned ? isRight ? rightRoads.nobody : leftRoads.nobody : straightRoads.nobody); break;
      }
    });
  }
  return realRoads;
}


export function getHouses(enumHouses: house[][]): House[][] {
  const realHouses: House[][] = [[], [], [], [], [], []];
  
  for (let i = 0; i < enumHouses.length; i++) {
    enumHouses[i].forEach((currentHouse: house): void => {
      const isCity: boolean = currentHouse.type === houseType.city;
      
      switch (currentHouse.owner) {
        case Owner.black: realHouses[i].push(isCity ? cities.black : villages.black); break;
        case Owner.blue: realHouses[i].push(isCity ? cities.blue : villages.blue); break;
        case Owner.green: realHouses[i].push(isCity ? cities.green : villages.green); break;
        case Owner.orange: realHouses[i].push(isCity ? cities.orange : villages.orange); break;
        default: realHouses[i].push(isCity ? cities.nobody : villages.nobody); break;
      }
    });
  }
  return realHouses;
}