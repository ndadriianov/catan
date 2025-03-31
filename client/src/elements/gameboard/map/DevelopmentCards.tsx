import {Box, Button, Card, FormControl, InputLabel, MenuItem, Select, Typography} from '@mui/material';
import socket from '../../../socket.ts';
import {useState} from 'react';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import classes from '../../../styles.module.css';
import player from '../../../typesDefinitions/room/player.ts';
import {resourceTypes} from '../../../typesDefinitions/resourceTypes.ts';

type Props = {
  me: player;
  isMyTurnNow: boolean;
}

type CardItemProps = {
  name: string;
  value: number;
  addValue: number;
  onApply: () => void;
  disabled: boolean;
}

const DevCardItem = ({name, value, addValue, onApply, disabled}: CardItemProps) => (
  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
    <Typography variant="body2" sx={{minWidth: 60}}>
      {name}:
    </Typography>
    <Typography variant="body2" sx={{fontWeight: 'bold', minWidth: 20, textAlign: 'center'}}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{fontWeight: 'bold', minWidth: 30, textAlign: 'center'}} color={addValue > 0 ? 'green' : 'orange'}>
      (+{addValue})
    </Typography>
    <Button
      variant="outlined"
      size="small"
      onClick={onApply}
      disabled={disabled}
      sx={{ml: 'auto', px: 1, fontSize: '0.75rem'}}
    >
      Применить
    </Button>
  </Box>
);

const DevelopmentCards = ({me, isMyTurnNow}: Props) => {
  const [showPurchaseSucceed, setShowPurchaseSucceed] = useState(false);
  const [showPurchaseFailed, setShowPurchaseFailed] = useState(false);
  const [showInventionModal, setShowInventionModal] = useState(false);
  const [showMonopolyModal, setShowMonopolyModal] = useState(false);
  const [inventionResource1, setInventionResource1] = useState<resourceTypes>(resourceTypes.clay);
  const [inventionResource2, setInventionResource2] = useState<resourceTypes>(resourceTypes.clay);
  const [monopolyResource, setMonopolyResource] = useState<resourceTypes>(resourceTypes.clay);
  
  const resourceOptions = [
    { value: resourceTypes.clay, label: 'Глина' },
    { value: resourceTypes.forrest, label: 'Дерево' },
    { value: resourceTypes.sheep, label: 'Овцы' },
    { value: resourceTypes.stone, label: 'Камень' },
    { value: resourceTypes.wheat, label: 'Пшеница' }
  ];
  
  function BuyDevCard(): void {
    socket.emit('buy-dev-card', (succeed: boolean): void => {
      if (succeed) setShowPurchaseSucceed(true);
      else setShowPurchaseFailed(true);
    })
  }
  function ActivateKnight(): void {
    socket.emit('activate-knight');
  }
  function ActivateRoadBuilding(): void {
    socket.emit('activate-road-building');
  }
  function ActivateInvention(): void {
    socket.emit('activate-invention', inventionResource1, inventionResource2);
  }
  function ActivateMonopoly(): void {
    socket.emit('activate-monopoly', monopolyResource);
  }
  
  return (
    <Box>
      <Card sx={{minWidth: 240, boxShadow: 3, bgcolor: 'background.paper'}}>
        <Box sx={{p: 1}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
              Карты развития
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={BuyDevCard}
              disabled={!isMyTurnNow || !me.threwTheDice}
              sx={{fontSize: '0.75rem'}}
            >
              купить
            </Button>
          </Box>
          
          <Card variant="outlined" sx={{p: 1, borderColor: 'divider'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              <DevCardItem
                name="Рыцарь"
                value={me.knights}
                addValue={me.addedKnights}
                onApply={ActivateKnight}
                disabled={!(isMyTurnNow && (!me.threwTheDice && !me.usedKnightThisTurn) && me.knights > 0)}
              />
              <DevCardItem
                name="Дороги"
                value={me.roadBuildings}
                addValue={me.addedRoadBuildings}
                onApply={ActivateRoadBuilding}
                disabled={!(isMyTurnNow && me.roadBuildings > 0 && me.threwTheDice)}
              />
              <DevCardItem
                name="Изобретение"
                value={me.inventions}
                addValue={me.addedInventions}
                onApply={() => setShowInventionModal(true)}
                disabled={!(isMyTurnNow && me.inventions > 0 && me.threwTheDice)}
              />
              <DevCardItem
                name="Монополия"
                value={me.monopolies}
                addValue={me.addedMonopolies}
                onApply={() => setShowMonopolyModal(true)}
                disabled={!(isMyTurnNow && me.monopolies > 0 && me.threwTheDice)}
              />
            </Box>
          </Card>
        </Box>
      </Card>
      
      <MovableModal id={'vpadc-ps'} isOpen={showPurchaseSucceed} onClose={() => setShowPurchaseSucceed(false)}>
        <Card className={classes.centeredModal}>
          <Typography whiteSpace={'nowrap'}>покупка карты развития состоялась</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'vpadc-pf'} isOpen={showPurchaseFailed} onClose={() => setShowPurchaseFailed(false)}>
        <Card className={classes.centeredModal}>
          <Typography whiteSpace={'nowrap'}>покупка карты развития не состоялась</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'invention-modal'} isOpen={showInventionModal} onClose={() => setShowInventionModal(false)}>
        <Card sx={{p: 2, minWidth: 250}}>
          <Typography variant="subtitle1" sx={{mb: 1, textAlign: 'center'}}>Выберите 2 ресурса</Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <FormControl fullWidth size="small">
              <InputLabel>Первый ресурс</InputLabel>
              <Select
                value={inventionResource1}
                onChange={(e) => setInventionResource1(e.target.value as resourceTypes)}
                label="Первый ресурс"
              >
                {resourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Второй ресурс</InputLabel>
              <Select
                value={inventionResource2}
                onChange={(e) => setInventionResource2(e.target.value as resourceTypes)}
                label="Второй ресурс"
              >
                {resourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button variant="contained" size="small" onClick={() => {
              ActivateInvention();
              setShowInventionModal(false);
            }}>
              Подтвердить
            </Button>
          </Box>
        </Card>
      </MovableModal>
      
      <MovableModal id={'monopoly-modal'} isOpen={showMonopolyModal} onClose={() => setShowMonopolyModal(false)}>
        <Card sx={{p: 2, minWidth: 250}}>
          <Typography variant="subtitle1" sx={{mb: 1, textAlign: 'center'}}>Выберите ресурс</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Ресурс</InputLabel>
            <Select
              value={monopolyResource}
              onChange={(e) => setMonopolyResource(e.target.value as resourceTypes)}
              label="Ресурс"
            >
              {resourceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              ActivateMonopoly();
              setShowMonopolyModal(false);
            }}
            sx={{mt: 2}}
          >
            Подтвердить
          </Button>
        </Card>
      </MovableModal>
    </Box>
  );
};

export default DevelopmentCards;