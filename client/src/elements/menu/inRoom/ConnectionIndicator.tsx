import classes from './InRoom.module.css';
import ConnectionStatus from '../../../typesDefinitions/connectionStatus.ts';

type ConnectionIndicatorProps = {
  status: ConnectionStatus
}

const colors: Array<string> = [
  'red',
  'yellow',
  'green',
  'gray'
]

const ConnectionIndicator = ({status}: ConnectionIndicatorProps) => {
  return (
    <div className={classes.connectionIndicator} style={{backgroundColor: colors[status]}} />
  );
};

export default ConnectionIndicator;