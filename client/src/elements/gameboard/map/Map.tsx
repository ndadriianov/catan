import HexagonalRow from '../hexagonalRow/HexagonalRow.tsx';
import classes from './Map.module.css';
import frame from '../../../assets/map/frame.png';
import TurnedRoadsRow from '../buildings/TurnedRoadsRow.tsx';
import initialTiles from '../../../constants/TileRows.ts';
import initialRoads from '../../../constants/RoadRows.ts';
import initialHouses from '../../../constants/HouseRows.ts';
import VertRoadsRow from '../buildings/VertRoadsRow.tsx';
import HousesRow from '../buildings/HousesRow.tsx';
import {useEffect, useState} from 'react';
import Loader from '../../UI/loader/Loader.tsx';
import {Owner} from '../../../typesDefinitions/room.ts';
import emitter from '../../../typesDefinitions/emitter.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import {House} from '../../../typesDefinitions/houses.ts';
import {changeColorHouse, changeColorRoad, Coords} from './operations.ts';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';


type mapProps = {
  owner: Owner;
}


const Map = ({owner}: mapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tiles, setTiles] = useState(initialTiles);
  const [roads, setRoads] = useState<Road[][]>(initialRoads);
  const [houses, setHouses] = useState<House[][]>(initialHouses);
  const [isConfirmationRequiredHouse, setIsConfirmationRequiredHouse] = useState<boolean>(false);
  const [isConfirmationRequiredRoad, setIsConfirmationRequiredRoad] = useState<boolean>(false);
  const [houseCoords, setHouseCoords] = useState<Coords>({x: -1, y: -1});
  const [roadCoords, setRoadCoords] = useState<Coords>({x: -1, y: -1});
  
  
  useEffect(() => {
    const roadHandler = (verticalIndex: number, index: number): void => {
      console.log('tap-on-road', verticalIndex, index);
      setRoadCoords({y: verticalIndex, x: index});
      changeColorRoad({coords: {x: index, y: verticalIndex}, owner: owner, setRoads: setRoads});
      setIsConfirmationRequiredRoad(true);
    };
    const houseHandler = (verticalIndex: number, index: number): void => {
      console.log('tap-on-house', verticalIndex, index, 'owner: ', owner);
      setHouseCoords({y: verticalIndex, x: index});
      changeColorHouse({coords: {x: index, y: verticalIndex}, owner: owner, toCity: true, setHouses: setHouses});
      setIsConfirmationRequiredHouse(true);
    };
    emitter.on('tap-on-road', roadHandler);
    emitter.on('tap-on-house', houseHandler);
    
    return (): void => {
      emitter.off('tap-on-road', roadHandler);
      emitter.off('tap-on-house', houseHandler);
    };
  }, [owner]);
  
  
  if (isLoading) return <Loader/>;
  
  
  return (
    <div>
      <div className={classes.container}>
        <img src={frame} alt={'frame'} className={classes.frame}/>
        
        <div className={classes.grid}>
          <HexagonalRow tiles={tiles[0]}/>
          <HexagonalRow tiles={tiles[1]}/>
          <HexagonalRow tiles={tiles[2]}/>
          <HexagonalRow tiles={tiles[3]}/>
          <HexagonalRow tiles={tiles[4]}/>
        </div>
        
        <div className={classes.roadsContainer}>
          <TurnedRoadsRow roads={roads[0]} verticalIndex={0} selectedCoords={roadCoords}/>
          <VertRoadsRow roads={roads[1]} verticalIndex={1} selectedCoords={roadCoords}/>
          <TurnedRoadsRow roads={roads[2]} verticalIndex={2} selectedCoords={roadCoords}/>
          <VertRoadsRow roads={roads[3]} verticalIndex={3} selectedCoords={roadCoords}/>
          <TurnedRoadsRow roads={roads[4]} verticalIndex={4} selectedCoords={roadCoords}/>
          <VertRoadsRow roads={roads[5]} verticalIndex={5} selectedCoords={roadCoords}/>
          <TurnedRoadsRow roads={roads[6]} verticalIndex={6} selectedCoords={roadCoords}/>
          <VertRoadsRow roads={roads[7]} verticalIndex={7} selectedCoords={roadCoords}/>
          <TurnedRoadsRow roads={roads[8]} verticalIndex={8} selectedCoords={roadCoords}/>
          <VertRoadsRow roads={roads[9]} verticalIndex={9} selectedCoords={roadCoords}/>
          <TurnedRoadsRow roads={roads[10]} verticalIndex={10} selectedCoords={roadCoords}/>
        </div>
        
        <div className={classes.housesContainer}>
          <HousesRow houses={houses[0]} isUpper={true} verticalIndex={0} selectedCoords={houseCoords}/>
          <HousesRow houses={houses[1]} isUpper={true} verticalIndex={1} selectedCoords={houseCoords}/>
          <HousesRow houses={houses[2]} isUpper={true} verticalIndex={2} selectedCoords={houseCoords}/>
          <HousesRow houses={houses[3]} isUpper={false} verticalIndex={3} selectedCoords={houseCoords}/>
          <HousesRow houses={houses[4]} isUpper={false} verticalIndex={4} selectedCoords={houseCoords}/>
          <HousesRow houses={houses[5]} isUpper={false} verticalIndex={5} selectedCoords={houseCoords}/>
        </div>
      </div>
      
      
      <MovableModal
        isOpen={isConfirmationRequiredHouse}
        onClose={(): void => {
          changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: true, setHouses: setHouses});
          setIsConfirmationRequiredHouse(false);
        }}
      >
        <button
          onClick={(): void => {
            setHouseCoords({y: -1, x: -1});
            setIsConfirmationRequiredHouse(false);
          }}
        >
          подтвердить
        </button>
        
        <button
          onClick={(): void => {
            changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: true, setHouses: setHouses});
            setIsConfirmationRequiredHouse(false);
          }}
        >
          отмена
        </button>
      </MovableModal>
      
      
      <MovableModal
        isOpen={isConfirmationRequiredRoad}
        onClose={() => {
          changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
          setIsConfirmationRequiredRoad(false);
        }}
      >
        <button onClick={(): void => {
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
      </MovableModal>
    </div>
  );
};

export default Map;