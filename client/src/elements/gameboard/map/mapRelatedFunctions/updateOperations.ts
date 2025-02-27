import Coords from '../../../../typesDefinitions/coords.ts';
import updateProps from '../../../../typesDefinitions/updateProps.ts';


export function isSelectedRoadInUpdate(update: updateProps, selected: Coords): boolean {
  return !!update.roads.find(road => road.x === selected.x && road.y === selected.y);
}

export function isSelectedHouseInUpdate(update: updateProps, selected: Coords): boolean {
  return !!(update.villages.find(village => village.x === selected.x && village.y === selected.y)
    || update.cities.find(city => city.x === selected.x && city.y === selected.y));
}

export function isSelectedCityInUpdate(update: updateProps, selected: Coords): boolean {
  return !!update.cities.find(city => city.x === selected.x && city.y === selected.y)
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

export function addVillageToUpdate(update: updateProps, selected: Coords): updateProps {
  if (isSelectedHouseInUpdate(update, selected)) return update;
  return {
    ...update,
    villages: [...update.villages, selected]
  };
}

export function addCityToUpdate(update: updateProps, selected: Coords): updateProps {
  if (isSelectedCityInUpdate(update, selected)) return update;
  return {
    ...update,
    cities: [...update.cities, selected]
  };
}

export function deleteVillageFromUpdate(update: updateProps, selected: Coords): updateProps {
  return {
    ...update,
    villages: update.villages.filter((village: Coords): boolean => village.x !== selected.x && village.y !== selected.y)
  };
}

export function deleteCityFromUpdate(update: updateProps, selected: Coords): updateProps {
  return {
    ...update,
    cities: update.cities.filter((city: Coords): boolean => city.x !== selected.x && city.y !== selected.y)
  }
}