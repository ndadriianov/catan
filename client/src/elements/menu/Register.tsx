import {useContext, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import socket from '../../socket.ts';
import MyModal from '../UI/modal/MyModal.tsx';
import UserContext from '../../context/UserContext.ts';


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showNameTaken, setShowNameTaken] = useState(false);
  
  const navigate = useNavigate();
  const usernameContext = useContext(UserContext);
  

  function handleRegister(): void {
    if (username.trim() && password.trim()) {
      socket.emit('register', username, password, (succeed: boolean): void => {
        if (!succeed) {
          setShowNameTaken(true);
          setUsername('');
          setPassword('');
          return;
        }
        usernameContext?.setUser({username, password});
        navigate('/choose-room');
      });
    }
  }
  
  return (
    <div>
      <div style={{textAlign: 'center', marginTop: '100px'}}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="придумайте логин"
          style={{padding: '10px', fontSize: '16px', marginBottom: '10px'}}
        />
        <br/>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="придумайте пароль"
          style={{padding: '10px', fontSize: '16px', marginBottom: '10px'}}
        />
        <br/>
        <button onClick={handleRegister} style={{marginTop: '10px', padding: '10px', fontSize: '16px'}}>
          Создать аккаунт
        </button>
        <br/>
        <Link to={'/login'}>Войти в существующий аккаунт</Link>
      </div>
      
      <MyModal visible={showNameTaken} setVisible={setShowNameTaken}>
        Данное имя уже занято!
      </MyModal>
    </div>
  );
};

export default Register;