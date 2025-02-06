import HexagonalRow from '../hexagonalRow/HexagonalRow.tsx';
import classes from './Map.module.css'
import frame from '../../../assets/map/frame.png';
import TurnedRoadsRow from '../roads/TurnedRoadsRow.tsx';
import {initialTiles} from '../../../constants/TileRows.ts';
import {roads1, roads2, roads3, roads4, roads5, roads6, roads7, roads8, roads9, roads10, roads11}
  from '../../../constants/RoadRows.ts';
import {houseRow1, houseRow2, houseRow3, houseRow4, houseRow5, houseRow6} from '../../../constants/HouseRows.ts';
import VertRoadsRow from '../roads/VertRoadsRow.tsx';
import HousesRow from '../houses/HousesRow.tsx';
import {useState} from 'react';
import Loader from '../../UI/loader/Loader.tsx';


const Map = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tiles, setTiles] = useState(initialTiles);
  
  
  if (isLoading) return <Loader />;
  
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
        <TurnedRoadsRow roads={roads1}/>
        <VertRoadsRow roads={roads2}/>
        <TurnedRoadsRow roads={roads3}/>
        <VertRoadsRow roads={roads4}/>
        <TurnedRoadsRow roads={roads5}/>
        <VertRoadsRow roads={roads6}/>
        <TurnedRoadsRow roads={roads7}/>
        <VertRoadsRow roads={roads8}/>
        <TurnedRoadsRow roads={roads9}/>
        <VertRoadsRow roads={roads10}/>
        <TurnedRoadsRow roads={roads11}/>
      </div>
      
      <div className={classes.housesContainer}>
        <HousesRow houses={houseRow1} isUpper={true}/>
        <HousesRow houses={houseRow2} isUpper={true}/>
        <HousesRow houses={houseRow3} isUpper={true}/>
        <HousesRow houses={houseRow4} isUpper={false}/>
        <HousesRow houses={houseRow5} isUpper={false}/>
        <HousesRow houses={houseRow6} isUpper={false}/>
      </div>
      
    </div>
  );
};

export default Map;