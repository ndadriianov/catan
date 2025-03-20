import Owner from '../../../typesDefinitions/owner.ts';
import Room from '../../../typesDefinitions/room/room.ts';
import Player from '../../../typesDefinitions/room/player.ts';
import Select from '../../UI/select/Select.tsx';

type TradeProps = {
  room: Room,
  color: Owner
}

const Trade = ({room, color}: TradeProps) => {
  const options = ['глина', 'лес', 'овцы', 'камень', 'пшеница'];
  
  enum resourceTypes {
    clay,
    forrest,
    sheep,
    stone,
    wheat
  }
  
  
  return (
    <div>
      <div>Торговля</div>
      
      <ul>
        {room.players
          .filter((player: Player) => player.color !== color)
          .map((player: Player, index: number) => (
            <li key={index}>
              <div>{player.username}</div>
            </li>
          ))}
      </ul>
      
      <div>
        <div>
          <div>купить</div>
          
          <div>
          
          </div>
        </div>
        
        <div>
          <div>продать</div>
          
          <div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;