import {Roads} from '../../../typesDefinitions/roads.ts';
import classes from './Roads.module.css'

type VertRoadsRowProps = {
  roads: Roads<number>
}

const VertRoadsRow = ({roads}: VertRoadsRowProps) => {
  return (
    <div className={classes.vertRoadsRow}>
      {roads.map((road, index) => (
        <img src={road} key={index} className={classes.vert} alt={'road'} />
      ))}
    </div>
  );
};

export default VertRoadsRow;