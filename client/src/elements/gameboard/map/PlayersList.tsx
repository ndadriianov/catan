import React, { useState } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, Typography, Chip, Box, useTheme, Divider, useMediaQuery, IconButton, Paper, Popper } from '@mui/material';
import { People } from '@mui/icons-material';
import ConnectionIndicator from '../../menu/inRoom/ConnectionIndicator.tsx';
import Player from '../../../typesDefinitions/room/player.ts';

type PlayersListProps = { players: Player[] };

const PlayersList = ({ players }: PlayersListProps) => {
  const theme = useTheme();
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const colorMap = [
    { eng: 'gray', ru: 'не выбран', hex: '#9e9e9e' },
    { eng: 'black', ru: 'чёрный', hex: '#212121' },
    { eng: 'blue', ru: 'синий', hex: '#1976d2' },
    { eng: 'green', ru: 'зелёный', hex: '#388e3c' },
    { eng: 'orange', ru: 'оранжевый', hex: '#f57c00' }
  ];
  
  const togglePopper = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  
  const styles = {
    avatar: (colorIndex: number) => ({
      bgcolor: colorMap[colorIndex].hex,
      width: isPortrait ? 36 : 40,
      height: isPortrait ? 36 : 40,
      fontSize: isPortrait ? '0.875rem' : '1rem'
    }),
    chip: (colorIndex: number) => ({
      bgcolor: `${colorMap[colorIndex].hex}20`,
      color: colorMap[colorIndex].hex,
      border: `1px solid ${colorMap[colorIndex].hex}30`,
      fontSize: '0.75rem',
      height: 24,
      mt: 0.5
    }),
    listItem: {
      px: isPortrait ? 2 : 3,
      py: isPortrait ? 1 : 1.5,
      '&:hover': { bgcolor: theme.palette.action.hover }
    },
    playerName: {
      fontWeight: 600,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: isPortrait ? '0.875rem' : '1rem'
    }
  };
  
  const renderPlayerItem = (player: Player, index: number) => (
    <Box key={index}>
      <ListItem sx={styles.listItem}>
        <ListItemAvatar sx={{ minWidth: isPortrait ? 40 : 48 }}>
          <Avatar sx={styles.avatar(player.color)}>
            {player.username.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1 }}><ConnectionIndicator status={player.status}/></Box>
            <Typography variant="subtitle1" sx={styles.playerName}>
              {player.username}
            </Typography>
          </Box>
          {!isPortrait && <Chip label={colorMap[player.color].ru} size="small" sx={styles.chip(player.color)} />}
        </Box>
      </ListItem>
      {index < players.length - 1 && <Divider variant="inset" sx={{ ml: isPortrait ? 7 : 9, mr: isPortrait ? 2 : 3 }} />}
    </Box>
  );
  
  return (
    <>
      {isPortrait ? (
        <>
          <IconButton onClick={togglePopper} sx={{
            backgroundColor: theme.palette.background.paper,
            '&:hover': { backgroundColor: theme.palette.action.hover }
          }}>
            <People />
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
              {players.length}
            </Typography>
          </IconButton>
          
          <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="bottom-start"
            modifiers={[{ name: 'offset', options: { offset: [-10, 10] } }]}
            sx={{ zIndex: theme.zIndex.modal, width: '200px', maxHeight: '60vh', overflow: 'auto' }}
          >
            <Paper sx={{ boxShadow: theme.shadows[6], borderRadius: '4px', overflow: 'hidden' }}>
              <List sx={{ p: 0 }}>{players.map(renderPlayerItem)}</List>
            </Paper>
          </Popper>
        </>
      ) : (
        <Paper sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1], overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>{players.map(renderPlayerItem)}</List>
        </Paper>
      )}
    </>
  );
};

export default PlayersList;