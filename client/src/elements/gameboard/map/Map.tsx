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
import {Inventory, Owner, Room, updateProps} from '../../../typesDefinitions/room.ts';
import emitter from '../../../typesDefinitions/emitter.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import {House} from '../../../typesDefinitions/houses.ts';
import {
  addHouseToUpdate, addRoadToUpdate,
  changeColorHouse,
  changeColorRoad,
  Coords, deleteHouseFromUpdate, deleteRoadFromUpdate,
  getHouses,
  getRoads,
  getTiles,
  isSelectedHouseInUpdate, isSelectedRoadInUpdate
} from './operations.ts';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import NumbersRow from '../number/NumbersRow.tsx';
import socket from '../../../socket.ts';


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
  const [isConfirmationRequiredHouse, setIsConfirmationRequiredHouse] = useState<boolean>(false);
  const [isConfirmationRequiredRoad, setIsConfirmationRequiredRoad] = useState<boolean>(false);
  const [isTurnIncorrect, setIsTurnIncorrect] = useState<boolean>(false);
  const [houseCoords, setHouseCoords] = useState<Coords>({x: -1, y: -1});
  const [roadCoords, setRoadCoords] = useState<Coords>({x: -1, y: -1});
  const [update, setUpdate] = useState<updateProps>({villages: [], cities: [], roads: []});
  
  
  useEffect(() => {
    function roadHandler(verticalIndex: number, index: number, isMyTurnNow: boolean, owner: Owner): void {
      console.log('tap-on-road', verticalIndex, index, isMyTurnNow);
      if (isMyTurnNow) {
        setRoadCoords({y: verticalIndex, x: index});
        changeColorRoad({coords: {x: index, y: verticalIndex}, owner: owner, setRoads: setRoads});
        setIsConfirmationRequiredRoad(true);
      }
    }
    function houseHandler(verticalIndex: number, index: number, isMyTurnNow: boolean, owner: Owner): void {
      console.log('tap-on-house', verticalIndex, index, 'owner: ', owner, isMyTurnNow);
      if (isMyTurnNow) {
        setHouseCoords({y: verticalIndex, x: index});
        changeColorHouse({coords: {x: index, y: verticalIndex}, owner: owner, toCity: false, setHouses: setHouses});
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
  
  
  function endTurn():void {
    socket.emit('end-turn', update, (succeed: boolean) => {
      if (!succeed) setIsTurnIncorrect(true);
      setUpdate({villages: [], cities: [], roads: []});
      socket.emit('refresh-room', room.id);
    });
  }
  
  
  if (isLoading) return <Loader/>;
  
  return (
    <div>
      <div>{room.counter}</div>
      {isMyTurnNow && <div>мой ход</div>}
      <div>{inventory.clay} - глина</div>
      <div>{inventory.forrest} - лес</div>
      <div>{inventory.sheep} - овцы</div>
      <div>{inventory.stone} - камень</div>
      <div>{inventory.wheat} - пшеница</div>
      {room.lastNumber > 0 &&<div>выпало число {room.lastNumber}</div>}
      
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
        isOpen={isConfirmationRequiredHouse}
        onClose={(): void => {
          if (!isSelectedHouseInUpdate(update, houseCoords)) {
            changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: true, setHouses: setHouses});
          }
          setIsConfirmationRequiredHouse(false);
          setHouseCoords({y: -1, x: -1});
        }}
      >
        {!isSelectedHouseInUpdate(update, houseCoords) ?
          <div>
            <button
              onClick={(): void => {
                const toCity: boolean = room.gameboard?.houses[houseCoords.y][houseCoords.x].owner !== Owner.nobody;
                setUpdate(update => addHouseToUpdate(update, houseCoords, toCity));
                setHouseCoords({y: -1, x: -1});
                setIsConfirmationRequiredHouse(false);
              }}
            >
              подтвердить
            </button>
            
            <button
              onClick={(): void => {
                changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
                setIsConfirmationRequiredHouse(false);
              }}
            >
              отмена
            </button>
          </div>
          :
          <div>
            <button
              onClick={(): void => {
                if (!update.cities.find(city => city.y === houseCoords.y && city.x === houseCoords.x)) {
                  changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
                }
                setUpdate(update => deleteHouseFromUpdate(update, houseCoords));
                setIsConfirmationRequiredHouse(false);
                setHouseCoords({y: -1, x: -1});
              }}
            >
              удалить
            </button>
            
            <button
              onClick={(): void => {
                setIsConfirmationRequiredHouse(false);
                setHouseCoords({y: -1, x: -1});
              }}
            >
              отмена
            </button>
          </div>
        }
      </MovableModal>
      
      
      <MovableModal
        isOpen={isConfirmationRequiredRoad}
        onClose={() => {
          if (!isSelectedRoadInUpdate(update, roadCoords)) {
            changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
          }
          setIsConfirmationRequiredRoad(false);
          setRoadCoords({y: -1, x: -1});
        }}
      >
        {!isSelectedRoadInUpdate(update, roadCoords) ?
          <div>
            <button onClick={(): void => {
              setUpdate(update => addRoadToUpdate(update, roadCoords));
              setRoadCoords({y: -1, x: -1});
              setIsConfirmationRequiredRoad(false);
            }}>
              подтвердить
            </button>
            
            <button onClick={(): void => {
              changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
              setIsConfirmationRequiredRoad(false);
            }}>
              отмена
            </button>
          </div>
          :
          <div>
            <button onClick={(): void => {
              setUpdate(update => deleteRoadFromUpdate(update, roadCoords));
              changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
              setIsConfirmationRequiredRoad(false);
              setRoadCoords({y: -1, x: -1});
            }}>
              удалить
            </button>
            
            <button onClick={(): void => {
              setIsConfirmationRequiredRoad(false);
              setRoadCoords({y: -1, x: -1});
            }}>
              отмена
            </button>
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