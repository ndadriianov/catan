import Number from './Number.tsx';
import classes from './Number.module.css'
import Coords from '../../../typesDefinitions/coords.ts';

type NumbersRowProps = {
  numbers: number[],
  y: number,
  robberPosition: Coords
  onClick: (coords: Coords) => void
}

const NumbersRow = ({numbers, y, robberPosition, onClick}: NumbersRowProps) => {
  return (
    <div className={classes.numbersRow}>
      {numbers.map((n, i) => (
        <Number number={n} key={i} robber={robberPosition.y === y && robberPosition.x === i} onClick={onClick} coords={{x: i, y: y}}/>
      ))}
    </div>
  );
};

export default NumbersRow;