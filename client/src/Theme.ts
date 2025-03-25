import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff'
    },
    secondary: {
      main: 'rgba(64,133,200,0.8)'
    },
    error: {
      main: '#d32f2f'
    }
  }
});