import { Box, Paper, Typography } from '@mui/material';

interface UnclosablePopupProps {
  message: string;
  visible: boolean;
}

const UnclosablePopup = ({ message, visible }: UnclosablePopupProps) => {
  if (!visible) return null;
  
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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main'
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default UnclosablePopup;