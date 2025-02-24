import {house, houseType, Owner, tile, updateProps} from '../../../typesDefinitions/room.ts';
import {cities, House, villages} from '../../../typesDefinitions/houses.ts';
import React from 'react';
import {leftRoads, rightRoads, Road, straightRoads} from '../../../typesDefinitions/roads.ts';
import {Tile, tiles} from '../../../typesDefinitions/tiles.ts';


type changeColorHouseProps = {
  coords: Coords,
  owner: Owner,
  toCity: boolean,
  setHouses: React.Dispatch<React.SetStateAction<House[][]>>
}

export function changeColorHouse({coords, owner, toCity, setHouses}: changeColorHouseProps): void {
  let newValue;
  if (toCity) {
    switch (owner) {
      case Owner.black: newValue = cities.black; break;
      case Owner.blue: newValue = cities.blue; break;
      case Owner.green: newValue = cities.green; break;
      case Owner.orange: newValue = cities.orange; break;
      default: newValue = cities.nobody; break;
    }
  } else {
    switch (owner) {
      case Owner.black: newValue = villages.black; break;
      case Owner.blue: newValue = villages.blue; break;
      case Owner.green: newValue = villages.green; break;
      case Owner.orange: newValue = villages.orange; break;
      default: newValue = villages.nobody; break;
    }
  }
  setHouses(((prevHouses: House[][]): House[][] =>
    prevHouses.map((row: House[], rowId: number): House[] =>
      rowId === coords.y ? row.map((house: House, id: number): House => id === coords.x ? newValue : house) : row
    ))
  );
}



type changeColorRoadProps = {
  coords: Coords,
  owner: Owner,
  setRoads: React.Dispatch<React.SetStateAction<Road[][]>>
}

export function changeColorRoad({coords, owner, setRoads}: changeColorRoadProps): void {
  let newValue;
  // turned
  if (coords.y % 2 === 0) {
    // right
    if ((coords.y < 5 && coords.x % 2 === 0) || (coords.y > 5 && coords.x % 2 === 1)) {
      switch (owner) {
        case Owner.black: newValue = rightRoads.black; break;
        case Owner.blue: newValue = rightRoads.blue; break;
        case Owner.green: newValue = rightRoads.green; break;
        case Owner.orange: newValue = rightRoads.orange; break;
        default: newValue = rightRoads.nobody; break;
      }
      // left  
    } else {
      switch (owner) {
        case Owner.black: newValue = leftRoads.black; break;
        case Owner.blue: newValue = leftRoads.blue; break;
        case Owner.green: newValue = leftRoads.green; break;
        case Owner.orange: newValue = leftRoads.orange; break;
        default: newValue = leftRoads.nobody; break;
      }
    }
    // straight  
  } else {
    switch (owner) {
      case Owner.black: newValue = straightRoads.black; break;
      case Owner.blue: newValue = straightRoads.blue; break;
      case Owner.green: newValue = straightRoads.green; break;
      case Owner.orange: newValue = straightRoads.orange; break;
      default: newValue = straightRoads.nobody; break;
    }
  }
  setRoads((prevRoads: Road[][]): Road[][] =>
    prevRoads.map((row: Road[], rowId: number): Road[] =>
      rowId === coords.y ? row.map((road: Road, id: number): Road => id === coords.x ? newValue : road) : row
    )
  );
}



export type Coords = {
  x: number;
  y: number;
}



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


export function isSelectedRoadInUpdate(update: updateProps, selected: Coords): boolean {
  return !!update.roads.find(road => road.x === selected.x && road.y === selected.y);
}
export function isSelectedHouseInUpdate(update: updateProps, selected: Coords): boolean {
  return !!(update.villages.find(village => village.x === selected.x && village.y === selected.y)
    || update.cities.find(city => city.x === selected.x && city.y === selected.y));
}
export function addRoadToUpdate(update: updateProps, selected: Coords): updateProps {
  if (isSelectedRoadInUpdate(update, selected)) return update;
  return {
    ...update,
    roads: [...update.roads, selected]
  };
}
export function deleteRoadFromUpdate(update: updateProps, selected: Coords): updateProps {
  return {
    ...update,
    roads: update.roads.filter((road: Coords): boolean => {
      return road.x !== selected.x || road.y !== selected.y;
    })
  };
}
export function addHouseToUpdate(update: updateProps, selected: Coords, toCity: boolean): updateProps {
  if (isSelectedHouseInUpdate(update, selected)) return update;
  if (toCity) {
    return {
      ...update,
      cities: [...update.cities, selected]
    };
  } else {
    return {
      ...update,
      villages: [...update.villages, selected]
    };
  }
}
export function deleteHouseFromUpdate(update: updateProps, selected: Coords): updateProps {
  return {
    ...update,
    cities: update.cities.filter((city: Coords): boolean => city.x !== selected.x || city.y !== selected.y),
    villages: update.villages.filter((village: Coords): boolean => village.x !== selected.x || village.y !== selected.y)
  };
}