import {Houses} from '../../../typesDefinitions/houses.ts';
import classes from './HousesRow.module.css'
import clsx from 'clsx'

type HousesRowProps = {
  houses: Houses<number>,
  isUpper: boolean
}

const HousesRow = ({houses, isUpper}: HousesRowProps) => {
  return (
    <div className={classes.housesRow}>
      {houses.map((house, index) => (
        <img
          src={house}
          key={index}
          className={
          isUpper ?
            index % 2 === 0 ?
              clsx(classes.house, classes.lower)
              :
              classes.house
            :
            index % 2 === 1 ?
              clsx(classes.house, classes.lower)
              :
              classes.house}
          alt={'House'} />
      ))}
    </div>
  );
};

export default HousesRow;