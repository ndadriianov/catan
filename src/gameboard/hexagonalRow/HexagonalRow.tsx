import classes from './HexagonalRow.module.css'

type Image = {
  src: string,
  alt?: string
}

type HexagonalRowProps = {
  tiles: Image[]
}

const HexagonalRow = ({tiles}: HexagonalRowProps) => {
  return (
    <div className={classes.hexagonalRow}>
      {tiles.map((tile, index) => (
        <img src={tile.src} key={index} className={classes.image} alt={tile.alt || ''} />
      ))}
    </div>
  );
};


export default HexagonalRow;