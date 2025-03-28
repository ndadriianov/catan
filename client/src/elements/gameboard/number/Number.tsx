import classes from './Number.module.css'
import Coords from '../../../typesDefinitions/coords.ts';

type NumberProps = {
  number: number;
  robber: boolean;
  coords: Coords;
  onClick: (coords: Coords) => void;
}

const Number = ({ number, robber, coords, onClick }: NumberProps) => {
  if (robber) return (
    <div className={classes.number} style={{color: 'red'}} onClick={() => onClick(coords)}>
      {number}
    </div>
  );
  return (
    <div className={classes.number} onClick={() => onClick(coords)}>
      {number}
    </div>
  );
};

export default Number;