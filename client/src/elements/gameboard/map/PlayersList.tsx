import React from 'react';
import classes from '../../menu/inRoom/InRoom.module.css';
import ConnectionIndicator from '../../menu/inRoom/ConnectionIndicator.tsx';
import Player from '../../../typesDefinitions/room/player.ts';


type PlayersListProps = {
  players: Player[];
}


const PlayersList = ({players}: PlayersListProps) => {
  const engColors: string[] = [
    'gray',
    'black',
    'blue',
    'green',
    'orange'
  ];
  const colors: string[] = [
    'не выбран',
    'черный',
    'синий',
    'зеленый',
    'оранжевый'
  ];
  
  return (
    <ul className={classes.roomList}>
      {players.map((player, index) => (
        <li className={classes.roomListElement} key={index}>
          <div className={classes.roomListElementName}>
            <ConnectionIndicator status={player.status}/>
            <div style={{color: '#2c4fff'}}>{player.username}</div>
          </div>
          <div style={{color: `${engColors[player.color]}`}}>{colors[player.color]}</div>
        </li>
      ))}
    </ul>
  );
};

export default PlayersList;