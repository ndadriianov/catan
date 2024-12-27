import HexagonalRow from '../hexagonalRow/HexagonalRow.jsx';
import classes from './Map.module.css'
import frame from '../../assets/map/frame.png';
import TurnedRoadsRow from '../roads/TurnedRoadsRow.tsx';
import {tilesRow3, tilesRow4, tilesRow5} from '../../constants/TileRows.ts'
import {roads1, roads2, roads3, roads4, roads5, roads6, roads7, roads8, roads9, roads10, roads11}
  from '../../constants/RoadRows.ts';
import VertRoadsRow from '../roads/VertRoadsRow.tsx';


const Map = () => {
  return (
    <div className={classes.container}>
      <img src={frame} alt={'frame'} className={classes.frame}/>
      
      <div className={classes.grid}>
        <HexagonalRow tiles={tilesRow3}/>
        <HexagonalRow tiles={tilesRow4}/>
        <HexagonalRow tiles={tilesRow5}/>
        <HexagonalRow tiles={tilesRow4}/>
        <HexagonalRow tiles={tilesRow3}/>
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
      
    </div>
  );
};

export default Map;