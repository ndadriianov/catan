import {Tile} from '../../../typesDefinitions/tiles.ts';
import classes from './HexagonalRow.module.css'

type HexagonalRowProps = {
  tiles: Tile[]
}

const HexagonalRow = ({tiles}: HexagonalRowProps) => {
  return (
    <div className={classes.hexagonalRow}>
      {tiles.map((tile, index) => (
        <img src={tile} key={index} className={classes.image} alt={'tile'} />
      ))}
    </div>
  );
};


export default HexagonalRow;