import Login from './elements/menu/Login.tsx';
import Register from './elements/menu/Register.tsx';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import ChooseRoom from './elements/menu/ChooseRoom.tsx';
import InRoom from './elements/menu/inRoom/InRoom.tsx';
import {useState} from 'react';
import GlobalHeader from './elements/menu/GlobalHeader.tsx';
import UserContext, {User} from './context/UserContext.ts';


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
          
          <Route path="*" element={<Navigate to={'/login'} replace/>}/>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;