import {cities, House, villages} from '../../../../typesDefinitions/houses.ts';
import React from 'react';
import {leftRoads, rightRoads, Road, straightRoads} from '../../../../typesDefinitions/roads.ts';
import Coords from '../../../../typesDefinitions/coords.ts';
import Owner from '../../../../typesDefinitions/owner.ts';


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
