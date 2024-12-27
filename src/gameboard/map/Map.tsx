import HexagonalRow from '../hexagonalRow/HexagonalRow.jsx';
import classes from './hexagonalGrid.module.css'
import clay from '../../assets/map/clay.png'
import frame from '../../assets/map/frame.png';

type Tile = {
  src: string;
};

const Map = () => {
  const tilesRow3: Tile[] = [
    { src: clay },
    { src: clay },
    { src: clay },
  ];
  const tilesRow4: Tile[] = [
    { src: clay },
    { src: clay },
    { src: clay },
    { src: clay },
  ];
  const tilesRow5: Tile[] = [
    { src: clay },
    { src: clay },
    { src: clay },
    { src: clay },
    { src: clay },
  ];
  
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
    </div>
  );
};

export default Map;