import Login from './elements/menu/Login.tsx';
import Register from './elements/menu/Register.tsx';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import ChooseRoom from './elements/menu/ChooseRoom.tsx';
import InRoom from './elements/menu/inRoom/InRoom.tsx';
import {useEffect, useState} from 'react';
import GlobalHeader from './elements/menu/GlobalHeader.tsx';
import UserContext, {User} from './context/UserContext.ts';
import Modal from 'react-modal';
import {CSSProperties} from 'react';
import {ThemeProvider} from '@mui/material';
import {theme} from './Theme.ts';
import {PreloadAssets} from "./PreloadAssets.ts";


function App() {
  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);
  
  const [user, setUser] = useState<User>({username: undefined, password: undefined});
  
  const appStyle: CSSProperties = {
    backgroundColor: 'cadetblue',
    backgroundImage: 'url("your-image-url.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    height: '100vh',
    width: '100vw',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
  };
  
  return (
    <div style={appStyle}>
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={{user, setUser}}>
          <PreloadAssets/>
          <BrowserRouter>
            <GlobalHeader/>
            
            <Routes>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/choose-room" element={<ChooseRoom/>}/>
              <Route path="/room" element={<InRoom/>}/>
              
              <Route path="*" element={<Navigate to={'/login'} replace/>}/>
            </Routes>
          </BrowserRouter>
        </UserContext.Provider></ThemeProvider>
    </div>
  );
}

export default App;