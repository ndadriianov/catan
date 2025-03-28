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
  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2}}>
    <Typography variant="body1" sx={{minWidth: 120 }}>
      {name}:
    </Typography>
    <Typography variant="body1" sx={{fontWeight: 'bold', minWidth: 30, textAlign: 'center'}}>
      {value}
    </Typography>
    <Typography variant="body1" sx={{fontWeight: 'bold', minWidth: 30, textAlign: 'center'}} color={addValue > 0 ? 'green' : 'orange'}>
      (+{addValue})
    </Typography>
    <Button variant="outlined" size="small" onClick={onApply} sx={{ml: 'auto', px: 2}} disabled={disabled}>
      Применить
    </Button>
  </Box>
);

const VictoryPointsAndDevelopmentCards = ({me, isMyTurnNow}: Props) => {
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
      <Box
        sx={{display: 'flex', justifyContent: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2,}}>
        <Card sx={{minWidth: 300, boxShadow: 3, bgcolor: 'background.paper',}}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="div" sx={{mb: 2, color: 'primary.main', fontWeight: 'bold', textAlign: 'center'}}>
              Победные очки:
              <Box component="span" sx={{ml: 1, fontSize: '1.5rem', color: 'success.main'}}>
                {me.victoryPoints}
              </Box>
            </Typography>
            
            <Card sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{mt: 2, m: 1, fontWeight: 'medium', color: 'text.secondary'}}>
                Карты развития
              </Typography>
              
              <Button variant="outlined" size="small" onClick={BuyDevCard} sx={{mr: 1}} disabled={!isMyTurnNow || !me.threwTheDice}>
                купить
              </Button>
            </Card>
            
            
            <Card variant="outlined" sx={{p: 2, borderColor: 'divider', bgcolor: 'action.hover',}}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DevCardItem
                  name="Рыцарь"
                  value={me.knights}
                  addValue={me.addedKnights}
                  onApply={ActivateKnight}
                  disabled={!(isMyTurnNow && (!me.threwTheDice && !me.usedKnightThisTurn) && me.knights > 0)}
                />
                <DevCardItem
                  name="Строительство дорог"
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
      </Box>
      
      
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
        <Card sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Выберите 2 ресурса которые вы хотите получить за изобретение</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Первый ресурс</InputLabel>
              <Select
                value={inventionResource1}
                onChange={(e) => setInventionResource1(e.target.value as resourceTypes)}
                label="Первый ресурс"
              >
                {resourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Второй ресурс</InputLabel>
              <Select
                value={inventionResource2}
                onChange={(e) => setInventionResource2(e.target.value as resourceTypes)}
                label="Второй ресурс"
              >
                {resourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              onClick={() => {
                ActivateInvention();
                setShowInventionModal(false);
              }}
            >
              Подтвердить
            </Button>
          </Box>
        </Card>
      </MovableModal>
      
      <MovableModal id={'monopoly-modal'} isOpen={showMonopolyModal} onClose={() => setShowMonopolyModal(false)}>
        <Card sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Выберите ресурс для монополии</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Ресурс</InputLabel>
              <Select
                value={monopolyResource}
                onChange={(e) => setMonopolyResource(e.target.value as resourceTypes)}
                label="Ресурс"
              >
                {resourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              onClick={() => {
                ActivateMonopoly();
                setShowMonopolyModal(false);
              }}
            >
              Подтвердить
            </Button>
          </Box>
        </Card>
      </MovableModal>
    </Box>
  );
};

export default VictoryPointsAndDevelopmentCards;