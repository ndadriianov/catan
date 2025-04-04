import {Box, Paper, Typography, Collapse, IconButton} from '@mui/material';
import {useState} from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface UnclosablePopupProps {
  messages: string[];
}

const UnclosablePopup = ({messages}: UnclosablePopupProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!messages.find(m => m !== '')) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1400,
        width: 'auto',
        maxWidth: '80%',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main'
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography variant="body1" sx={{fontWeight: 'medium'}}>
            У вас {messages.filter(m => m !== '').length} оповещения
          </Typography>
          {messages.length > 0 && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ml: 1}}
            >
              {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
            </IconButton>
          )}
        </Box>

        <Collapse in={expanded && messages.length > 1}>
          <Box sx={{mt: 1, display: 'flex', flexDirection: 'column'}}>
            {messages.filter(m => m !== '').map((message, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{
                  fontWeight: 'medium',
                  pt: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {message}
              </Typography>
            ))}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default UnclosablePopup;