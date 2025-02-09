import HexagonalRow from '../hexagonalRow/HexagonalRow.tsx';
import classes from './Map.module.css'
import frame from '../../../assets/map/frame.png';
import TurnedRoadsRow from '../roads/TurnedRoadsRow.tsx';
import initialTiles from '../../../constants/TileRows.ts';
import initialRoads from '../../../constants/RoadRows.ts';
import initialHouses from '../../../constants/HouseRows.ts';
import VertRoadsRow from '../roads/VertRoadsRow.tsx';
import HousesRow from '../houses/HousesRow.tsx';
import {useState} from 'react';
import Loader from '../../UI/loader/Loader.tsx';
import {Owner} from '../../../typesDefinitions/room.ts';
import emitter from '../../../typesDefinitions/emitter.ts';
import {leftRoads, rightRoads, Road, straightRoads} from '../../../typesDefinitions/roads.ts';
import {cities, House, villages} from '../../../typesDefinitions/houses.ts';
import MyModal from '../../UI/modal/MyModal.tsx';


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
  const [coords, setCoords] = useState<number[]>([-1, -1]);
  
  
  
  if (isLoading) return <Loader />;
  
  
  
  function changeColorRoad(verticalIndex: number, index: number): void {
    let newValue;
    // turned
    if (verticalIndex % 2 === 0) {
      // right
      if ((verticalIndex < 5 && index % 2 === 0) || (verticalIndex > 5 && index % 2 === 1)) {
        switch (owner) {
          case Owner.black: newValue = rightRoads.black; break;
          case Owner.blue: newValue = rightRoads.blue; break;
          case Owner.green: newValue = rightRoads.green; break;
          case Owner.orange: newValue = rightRoads.orange; break;
          case Owner.red: newValue = rightRoads.red; break;
          case Owner.yellow: newValue = rightRoads.yellow; break;
          default: newValue = rightRoads.nobody; break;
        }
      // left  
      } else {
        switch (owner) {
          case Owner.black: newValue = leftRoads.black; break;
          case Owner.blue: newValue = leftRoads.blue; break;
          case Owner.green: newValue = leftRoads.green; break;
          case Owner.orange: newValue = leftRoads.orange; break;
          case Owner.red: newValue = leftRoads.red; break;
          case Owner.yellow: newValue = leftRoads.yellow; break;
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
        case Owner.red: newValue = straightRoads.red; break;
        case Owner.yellow: newValue = straightRoads.yellow; break;
        default: newValue = straightRoads.nobody; break;
      }
    }
    setRoads((prevRoads) =>
      prevRoads.map((row, rowId) =>
        rowId === verticalIndex ? row.map((road, id) => id === index ? newValue : road) : row
      )
    );
  }
  function changeColorHouse(verticalIndex: number, index: number, toCity: boolean): void {
    let newValue;
    if (toCity) {
      switch (owner) {
        case Owner.black: newValue = cities.black; break;
        case Owner.blue: newValue = cities.blue; break;
        case Owner.green: newValue = cities.green; break;
        case Owner.orange: newValue = cities.orange; break;
        case Owner.red: newValue = cities.red; break;
        case Owner.yellow: newValue = cities.yellow; break;
        default: newValue = cities.nobody; break;
      }
    } else {
      switch (owner) {
        case Owner.black: newValue = villages.black; break;
        case Owner.blue: newValue = villages.blue; break;
        case Owner.green: newValue = villages.green; break;
        case Owner.orange: newValue = villages.orange; break;
        case Owner.red: newValue = villages.red; break;
        case Owner.yellow: newValue = villages.yellow; break;
        default: newValue = villages.nobody; break;
      }
    }
    setHouses((prevHouses) =>
      prevHouses.map((row, rowId) =>
        rowId === verticalIndex ? row.map((house, id) => id === index ? newValue : house) : row
      )
    );
  }

  
  emitter.on('tap-on-road', (verticalIndex: number, index: number): void => {
    console.log('tap-on-road', verticalIndex, index);
    setCoords([verticalIndex, index]);
    setIsConfirmationRequiredRoad(true);
  });
  
  emitter.on('tap-on-house', (verticalIndex: number, index: number): void => {
    console.log('tap-on-house', verticalIndex, index);
    setCoords([verticalIndex, index]);
    setIsConfirmationRequiredHouse(true);
  })
  
  
  return (
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
        <TurnedRoadsRow roads={roads[0]} verticalIndex={0}/>
        <VertRoadsRow roads={roads[1]} verticalIndex={1}/>
        <TurnedRoadsRow roads={roads[2]} verticalIndex={2}/>
        <VertRoadsRow roads={roads[3]} verticalIndex={3}/>
        <TurnedRoadsRow roads={roads[4]} verticalIndex={4}/>
        <VertRoadsRow roads={roads[5]} verticalIndex={5}/>
        <TurnedRoadsRow roads={roads[6]} verticalIndex={6}/>
        <VertRoadsRow roads={roads[7]} verticalIndex={7}/>
        <TurnedRoadsRow roads={roads[8]} verticalIndex={8}/>
        <VertRoadsRow roads={roads[9]} verticalIndex={9}/>
        <TurnedRoadsRow roads={roads[10]} verticalIndex={10}/>
      </div>
      
      <div className={classes.housesContainer}>
        <HousesRow houses={houses[0]} isUpper={true} verticalIndex={0}/>
        <HousesRow houses={houses[1]} isUpper={true} verticalIndex={1}/>
        <HousesRow houses={houses[2]} isUpper={true} verticalIndex={2}/>
        <HousesRow houses={houses[3]} isUpper={false} verticalIndex={3}/>
        <HousesRow houses={houses[4]} isUpper={false} verticalIndex={4}/>
        <HousesRow houses={houses[5]} isUpper={false} verticalIndex={5}/>
      </div>
      
      <MyModal
        visible={isConfirmationRequiredHouse}
        setVisible={setIsConfirmationRequiredHouse}
      >
        <button
          onClick={(): void => {
            changeColorHouse(coords[0], coords[1], true);
            setIsConfirmationRequiredHouse(false);
          }}
        >
          подтвердить
        </button>
        
        <button onClick={(): void => {setIsConfirmationRequiredHouse(false);}}>
          отмена
        </button>
      </MyModal>
      
      
      <MyModal
        visible={isConfirmationRequiredRoad}
        setVisible={setIsConfirmationRequiredRoad}
      >
        <button
          onClick={(): void => {
            changeColorRoad(coords[0], coords[1]);
            setIsConfirmationRequiredRoad(false);
          }}
        >
          подтвердить
        </button>
        
        <button onClick={(): void => {
          setIsConfirmationRequiredRoad(false);
        }}>
          отмена
        </button>
      </MyModal>
    </div>
  );
};

export default Map;