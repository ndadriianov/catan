import {Roads} from '../../typesDefinitions/roads.ts';
import classes from './Roads.module.css'

type TurnedRoadsRowProps = {
  roads: Roads<number>
}

const TurnedRoadsRow = ({roads}: TurnedRoadsRowProps) => {
  return (
    <div className={classes.turnedRoadsRow}>
      {roads.map((road, index) => (
        <img src={road} key={index} className={classes.turned} alt={'road'} />
      ))}
    </div>
  );
};

export default TurnedRoadsRow;