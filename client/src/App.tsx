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


function App() {
  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);
  
  const [user, setUser] = useState<User>({username: undefined, password: undefined});
  
  const appStyle: CSSProperties = {
    backgroundColor: 'cadetblue', // Цвет фона
    backgroundImage: 'url("your-image-url.jpg")', // Изображение на фоне
    backgroundSize: 'cover', // Покрывает весь экран
    backgroundPosition: 'center', // Центрирует изображение
    backgroundAttachment: 'fixed', // Чтобы фон оставался фиксированным при прокрутке
    height: '100vh', // Высота на весь экран
    width: '100vw', // Ширина на весь экран
    margin: 0, // Убираем отступы по умолчанию
    display: 'flex', // Чтобы компоненты внутри можно было выравнивать
    flexDirection: 'column', // Например, для вертикального выравнивания
    //justifyContent: 'center', // Чтобы элементы по центру по вертикали
    //alignItems: 'center', // Чтобы элементы по центру по горизонтали
  };
  
  return (
    <div style={appStyle}>
      <ThemeProvider theme={theme}>
        <UserContext.Provider value={{user, setUser}}>
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