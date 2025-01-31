import Login from './elements/menu/Login.tsx';
import Register from './elements/menu/Register.tsx';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import ChooseRoom from './elements/menu/ChooseRoom.tsx';
import InRoom from './elements/menu/InRoom.tsx';
import {useState} from 'react';
import GlobalHeader from './elements/menu/GlobalHeader.tsx';
import UserContext, {User} from './context/UserContext.ts';
import Map from './elements/gameboard/map/Map.tsx';


function App() {
  const [user, setUser] = useState<User>({username: undefined, password: undefined});
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <GlobalHeader/>
        
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/choose-room" element={<ChooseRoom/>}/>
          <Route path="/room" element={<InRoom/>}/>
          <Route path="/map" element={<Map/>}/>
          
          <Route path="*" element={<Navigate to={'/login'} replace/>}/>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;

/*
 * (done)ПОЛУЧИЛОСЬ СОХРАНИТЬ ПОЛЬЗОВАТЕЛЯ ПРИ ОБНОВЛЕНИИ СТРАНИЦЫ, ЕСТЬ ЧТО-ТО ПОХОЖЕЕ НА НОРМАЛЬНЫЙ ВЫБОР КОМНАТЫ
 *
 * (done)НАДО СДЕЛАТЬ ОТКЛЮЧЕНИЕ ОТ КОМНАТЫ ПРИ ВЫХОДЕ ИЗ АККАУНТА/ПРЕКРАЩЕНИИ СОЕДИНЕНИЯ
 *
 * (done)НАДО ПРЕДОТВРАТИТЬ ДОСТУП К АККАУНТУ ИЗ НЕСКОЛЬКИХ ОКОН. ТО ЕСТЬ ПЕРЕД АВТОРИЗАЦИЕЙ ПРОВЕРЯТЬ, АКТИВЕН ЛИ ДАННЫЙ ПОЛЬЗОВАТЕЛЬ
 *
 * ЗАМЕНИТЬ ТИП isActive НА enum green yellow red, ГДЕ red = false, yellow - ВРЕМЯ НА ПЕРЕПОДКЛЮЧЕНИЕ НЕ ИСТЕКЛО, green = true
 *
 * СДЕЛАТЬ ОТОБРАЖЕНИЕ ЭТОГО СТАТУСА НА КЛИЕНТЕ
 *
 * НАДО СДЕЛАТЬ МЕХАНИЗМ ЗАПУСКА ИГРЫ
 *
 * (note)ПРИ ИЗМЕНЕНИИ СПИСКА ДОСТУПНЫХ КОМНАТ СОБЫТИЕ ПОЛУЧАЮТ ВСЕ ПОДКЛЮЧЕННЫЕ ПОЛЬЗОВАТЕЛИ, ЭТО НЕ МЕШАЕТ РАБОТЕ, НО ОТПРАВЛЯЮТСЯ ЛИШНИЕ ЗАПРОСЫ
 */