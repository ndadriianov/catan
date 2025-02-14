import classes from './Number.module.css'

type NumberProps = {
  number: number;
}

const Number = ({ number }: NumberProps) => {
  return (
    <div className={classes.number}>
      {number}
    </div>
  );
};

export default Number;