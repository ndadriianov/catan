import HexagonalRow from '../hexagonalRow/HexagonalRow.tsx';
import classes from './Map.module.css';
import frame from '../../../assets/map/frame.png';
import TurnedRoadsRow from '../buildings/TurnedRoadsRow.tsx';
import initialTiles, {initialNumbers} from '../../../constants/TileRows.ts';
import initialRoads from '../../../constants/RoadRows.ts';
import initialHouses from '../../../constants/HouseRows.ts';
import VertRoadsRow from '../buildings/VertRoadsRow.tsx';
import HousesRow from '../buildings/HousesRow.tsx';
import React, {useEffect, useState} from 'react';
import Loader from '../../UI/loader/Loader.tsx';
import Room from '../../../typesDefinitions/room/room.ts';
import emitter from '../../../typesDefinitions/emitter.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import {House} from '../../../typesDefinitions/houses.ts';
import {changeColorHouse, changeColorRoad} from './mapRelatedFunctions/changeColorOperations.ts';
import {
  addCityToUpdate,
  addRoadToUpdate,
  addVillageToUpdate,
  deleteCityFromUpdate,
  deleteRoadFromUpdate,
  deleteVillageFromUpdate, isSelectedCityInUpdate,
  isSelectedHouseInUpdate,
  isSelectedRoadInUpdate, isSelectedVillageInUpdate
} from './mapRelatedFunctions/updateOperations.ts';
import {getHouses, getRoads, getTiles} from './mapRelatedFunctions/mapObjectsProcessing.ts';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import NumbersRow from '../number/NumbersRow.tsx';
import socket from '../../../socket.ts';
import Costs from '../../../typesDefinitions/costs.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import Inventory from '../../../typesDefinitions/room/inventory.ts';
import updateProps from '../../../typesDefinitions/updateProps.ts';
import house from '../../../typesDefinitions/house/house.ts';
import houseType from '../../../typesDefinitions/house/houseType.ts';


type mapProps = {
  owner: Owner;
  room: Room;
  isMyTurnNow: boolean;
  inventory: Inventory;
}


const Map = ({owner, room, isMyTurnNow, inventory}: mapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tiles, setTiles] = useState(initialTiles);
  const [numbers, setNumbers] = useState<number[][]>(initialNumbers);
  const [roads, setRoads] = useState<Road[][]>(initialRoads);
  const [houses, setHouses] = useState<House[][]>(initialHouses);
  const [isRoadNobodys, setIsRoadNobodys] = useState(false);
  const [isHouseNobodys, setIsHouseNobodys] = useState(false);
  const [isMyVillage, setIsMyVillage] = useState(false);
  const [isMyUpdateVillage, setIsMyUpdateVillage] = useState(false);
  const [isMyUpdateCity, setIsMyUpdateCity] = useState(false);
  const [isConfirmationRequiredHouse, setIsConfirmationRequiredHouse] = useState<boolean>(false);
  const [isConfirmationRequiredRoad, setIsConfirmationRequiredRoad] = useState<boolean>(false);
  const [isTurnIncorrect, setIsTurnIncorrect] = useState<boolean>(false);
  const [houseCoords, setHouseCoords] = useState<Coords>({x: -1, y: -1});
  const [roadCoords, setRoadCoords] = useState<Coords>({x: -1, y: -1});
  const [update, setUpdate] = useState<updateProps>({villages: [], cities: [], roads: []});
  const [costs, setCosts] = useState<Costs>({clay: 0, forrest: 0, sheep: 0, stone: 0, wheat: 0});
  
  
  useEffect(() => {
    function roadHandler(y: number, x: number, isMyTurnNow: boolean, owner: Owner): void {
      const isNobodys: boolean = room.gameboard?.roads[y][x] === Owner.nobody;
      
      if (isMyTurnNow && isNobodys) {
        setRoadCoords({x: x, y: y});
        setIsRoadNobodys(isNobodys);
        changeColorRoad({coords: {x: x, y: y}, owner: owner, setRoads: setRoads});
        setIsConfirmationRequiredRoad(true);
      }
    }
    
    function houseHandler(y: number, x: number, isMyTurnNow: boolean, owner: Owner, update: updateProps): void {
      const currentHouse: house | undefined = room.gameboard?.houses[y][x];
      const isNobodys: boolean = currentHouse?.owner === Owner.nobody;
      const isMyVillage: boolean = currentHouse?.owner === owner && currentHouse?.type === houseType.village;
      const isMyUpdateVillage: boolean = !!update.villages.find((village: Coords):boolean => village.x === x && village.y === y);
      const isMyCity: boolean = currentHouse?.owner === owner && currentHouse?.type === houseType.city;
      const isMyUpdateCity: boolean = !!update.cities.find((city: Coords): boolean => city.x === x && city.y === y);
      
      if (isMyTurnNow && (isNobodys || isMyVillage || isMyUpdateVillage) && !isMyCity) {
        setHouseCoords({y: y, x: x});
        setIsHouseNobodys(isNobodys);
        setIsMyVillage(isMyVillage);
        setIsMyUpdateVillage(isMyUpdateVillage);
        setIsMyUpdateCity(isMyUpdateCity);
        changeColorHouse({coords: {x: x, y: y}, owner: owner, toCity: isMyUpdateCity, setHouses: setHouses});
        setIsConfirmationRequiredHouse(true);
      }
    }
    
    emitter.on('tap-on-road', roadHandler);
    emitter.on('tap-on-house', houseHandler);
    
    return (): void => {
      emitter.off('tap-on-road', roadHandler);
      emitter.off('tap-on-house', houseHandler);
    };
  }, [owner]);
  
  
  useEffect(() => {
    if (room.gameboard?.tiles) {
      setTiles(getTiles(room.gameboard?.tiles));
      setNumbers(room.gameboard.numbers);
    }
  }, [room.gameboard?.tiles]);
  
  useEffect(() => {
    if (room.gameboard) {
      setRoads(getRoads(room.gameboard.roads));
      setHouses(getHouses(room.gameboard.houses));
    }
  }, [room.gameboard]);
  
  function closeRoadModal(): void {
    if (!isSelectedRoadInUpdate(update, roadCoords) && isRoadNobodys) {
      changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    }
    setIsConfirmationRequiredRoad(false);
    setRoadCoords({y: -1, x: -1});
  }
  function buyRoad(): void {
    if (!isSelectedRoadInUpdate(update, roadCoords)) {
      costs.clay++;
      costs.forrest++;
    }
    setUpdate(update => addRoadToUpdate(update, roadCoords));
    setRoadCoords({y: -1, x: -1});
    setIsConfirmationRequiredRoad(false);
  }
  function cancelRoadPurchase(): void {
    if (isRoadNobodys) changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    setRoadCoords({y: -1, x: -1});
    setIsConfirmationRequiredRoad(false);
  }
  function deleteRoad(): void {
    if (isSelectedRoadInUpdate(update, roadCoords)) {
      costs.clay--;
      costs.forrest--;
    }
    setUpdate(update => deleteRoadFromUpdate(update, roadCoords));
    changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    setIsConfirmationRequiredRoad(false);
    setRoadCoords({y: -1, x: -1});
  }
  function cancelRoadDeletion(): void {
    setIsConfirmationRequiredRoad(false);
    setRoadCoords({y: -1, x: -1});
  }
  
  function closeHouseModal(): void {
    if (!isSelectedHouseInUpdate(update, houseCoords) && isHouseNobodys) {
      changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: true, setHouses: setHouses});
    }
    setIsConfirmationRequiredHouse(false);
    setHouseCoords({y: -1, x: -1});
  }
  function buyVillage(): void {
    if (!isSelectedVillageInUpdate(update, houseCoords)) {
      costs.clay++;
      costs.forrest++;
      costs.sheep++;
      costs.wheat++;
    }
    setUpdate((update: updateProps): updateProps => addVillageToUpdate(update, houseCoords));
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function buyCity(): void {
    if (!isSelectedCityInUpdate(update, houseCoords)) {
      costs.wheat += 2;
      costs.stone += 3;
    }
    setUpdate((update: updateProps): updateProps => addCityToUpdate(update, houseCoords));
    changeColorHouse({coords: houseCoords, owner: owner, toCity: true, setHouses: setHouses});
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function cancelVillagePurchase(): void {
    changeColorHouse({
      coords: houseCoords,
      owner: Owner.nobody,
      toCity: false,
      setHouses: setHouses
    });
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function cancelCityPurchase(): void {
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function deleteVillage(): void {
    if (isSelectedVillageInUpdate(update, houseCoords)) {
      costs.clay--;
      costs.forrest--;
      costs.sheep--;
      costs.wheat--;
    }
    setUpdate(update => deleteVillageFromUpdate(update, houseCoords));
    changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
    setIsConfirmationRequiredHouse(false);
    setHouseCoords({y: -1, x: -1});
  }
  function degradeToVillage(): void {
    if (isSelectedCityInUpdate(update, houseCoords)) {
      costs.wheat -= 2;
      costs.stone -= 3;
    }
    setUpdate(update => deleteCityFromUpdate(update, houseCoords));
    changeColorHouse({coords: houseCoords, owner: owner, toCity: false, setHouses: setHouses});
    setIsConfirmationRequiredHouse(false);
    setHouseCoords({y: -1, x: -1});
  }
  
  function endTurn(): void {
    socket.emit('end-turn', update, (succeed: boolean) => {
      if (!succeed) setIsTurnIncorrect(true);
      setUpdate({villages: [], cities: [], roads: []});
      setCosts({clay: 0, forrest: 0, sheep: 0, stone: 0, wheat: 0});
      socket.emit('refresh-room', room.id);
    });
  }
  
  
  if (isLoading) return <Loader/>;
  
  return (
    <div>
      <div>
        <div>{room.counter}</div>
        {isMyTurnNow && <div>мой ход</div>}
        <div>{inventory.clay} - глина</div>
        <div>{inventory.forrest} - лес</div>
        <div>{inventory.sheep} - овцы</div>
        <div>{inventory.stone} - камень</div>
        <div>{inventory.wheat} - пшеница</div>
        {room.lastNumber > 0 && <div>выпало число {room.lastNumber}</div>}
        
        <div>цена покупок</div>
        <div>{costs.clay} - глина</div>
        <div>{costs.forrest} - лес</div>
        <div>{costs.sheep} - овцы</div>
        <div>{costs.stone} - камень</div>
        <div>{costs.wheat} - пшеница</div>
      </div>
      
      
      <div className={classes.container} style={{scale: '80%'}}>
        <img src={frame} alt={'frame'} className={classes.frame}/>
        
        
        <div className={classes.grid}>
          <HexagonalRow tiles={tiles[0]}/>
          <HexagonalRow tiles={tiles[1]}/>
          <HexagonalRow tiles={tiles[2]}/>
          <HexagonalRow tiles={tiles[3]}/>
          <HexagonalRow tiles={tiles[4]}/>
        </div>
        
        <div className={classes.roadsContainer}>
          <TurnedRoadsRow roads={roads[0]} verticalIndex={0} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                          owner={owner} update={update}/>
          <VertRoadsRow roads={roads[1]} verticalIndex={1} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
          <TurnedRoadsRow roads={roads[2]} verticalIndex={2} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                          owner={owner} update={update}/>
          <VertRoadsRow roads={roads[3]} verticalIndex={3} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
          <TurnedRoadsRow roads={roads[4]} verticalIndex={4} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                          owner={owner} update={update}/>
          <VertRoadsRow roads={roads[5]} verticalIndex={5} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
          <TurnedRoadsRow roads={roads[6]} verticalIndex={6} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                          owner={owner} update={update}/>
          <VertRoadsRow roads={roads[7]} verticalIndex={7} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
          <TurnedRoadsRow roads={roads[8]} verticalIndex={8} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                          owner={owner} update={update}/>
          <VertRoadsRow roads={roads[9]} verticalIndex={9} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
          <TurnedRoadsRow roads={roads[10]} verticalIndex={10} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                          owner={owner} update={update}/>
        </div>
        
        <div className={classes.housesContainer}>
          <HousesRow houses={houses[0]} isUpper={true} verticalIndex={0} selectedCoords={houseCoords}
                     isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
          <HousesRow houses={houses[1]} isUpper={true} verticalIndex={1} selectedCoords={houseCoords}
                     isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
          <HousesRow houses={houses[2]} isUpper={true} verticalIndex={2} selectedCoords={houseCoords}
                     isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
          <HousesRow houses={houses[3]} isUpper={false} verticalIndex={3} selectedCoords={houseCoords}
                     isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
          <HousesRow houses={houses[4]} isUpper={false} verticalIndex={4} selectedCoords={houseCoords}
                     isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
          <HousesRow houses={houses[5]} isUpper={false} verticalIndex={5} selectedCoords={houseCoords}
                     isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
        </div>
        
        <div className={classes.numbersContainer}>
          <NumbersRow numbers={numbers[0]}/>
          <NumbersRow numbers={numbers[1]}/>
          <NumbersRow numbers={numbers[2]}/>
          <NumbersRow numbers={numbers[3]}/>
          <NumbersRow numbers={numbers[4]}/>
        </div>
      </div>
      
      
      <MovableModal
        isOpen={isConfirmationRequiredRoad}
        onClose={closeRoadModal}
      >
        {!isSelectedRoadInUpdate(update, roadCoords) ?
          <div>
            <button onClick={buyRoad}>
              подтвердить
            </button>
            <button onClick={cancelRoadPurchase}>
              отмена
            </button>
          </div>
          :
          <div>
            <button onClick={deleteRoad}>
              удалить
            </button>
            <button onClick={cancelRoadDeletion}>
              отмена
            </button>
          </div>
        }
      </MovableModal>
      
      
      <MovableModal
        isOpen={isConfirmationRequiredHouse}
        onClose={closeHouseModal}
      >
        {(isMyVillage || isMyUpdateVillage) && !isMyUpdateCity ?
          <div>
            <button onClick={buyCity}>
              купить город
            </button>
            {isHouseNobodys && <button onClick={deleteVillage}>удалить деревню</button>}
            <button onClick={cancelCityPurchase}>
              отмена
            </button>
          </div>
          :
          isMyUpdateCity ?
            <div>
              <button onClick={degradeToVillage}>понизить до деревни</button>
              <button onClick={cancelCityPurchase}>отмена</button>
            </div>
            :
            <div>
              <button onClick={buyVillage}>купить деревню</button>
              <button onClick={cancelVillagePurchase}>отмена</button>
            </div>
        }
      </MovableModal>
      
      <MovableModal
        isOpen={isTurnIncorrect}
        onClose={() => setIsTurnIncorrect(false)}
      >
        Такой ход невозможен. Попробуйте снова
      </MovableModal>
      
      <button onClick={endTurn}>завершить ход</button>
      
      <button onClick={() => console.log(update)}>console.log(update)</button>
    </div>
  );
};

export default Map;