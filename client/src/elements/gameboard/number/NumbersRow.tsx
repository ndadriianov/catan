import Number from './Number.tsx';
import classes from './Number.module.css'

type NumbersRowProps = {
  numbers: number[]
}

const NumbersRow = ({numbers}: NumbersRowProps) => {
  return (
    <div className={classes.numbersRow}>
      {numbers.map((n, i) => (
        <Number number={n} key={i}/>
      ))}
    </div>
  );
};

export default NumbersRow;