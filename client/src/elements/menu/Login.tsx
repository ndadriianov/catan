import {useContext, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import socket from '../../socket.ts';
import MyModal from '../modal/MyModal.tsx';
import UserContext from '../../context/UserContext.ts';


const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isIncorrect, setIsIncorrect] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const usernameContext = useContext(UserContext);
  
  function handleLogin(): void {
    if (username.trim()) {
      socket.emit('login', username, password, (succeed: boolean): void => {
        if (succeed) {
          usernameContext?.setUser({username, password});
          navigate(`/choose-room`);
        } else {
          setIsIncorrect(true);
        }
      });
    }
  }
  
  return (
    <div style={{textAlign: 'center', marginTop: '100px'}}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="введите логин"
        style={{padding: '10px', fontSize: '16px', marginBottom: '10px'}}
      />
      <br/>
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="введите пароль"
        style={{padding: '10px', fontSize: '16px', marginBottom: '10px'}}
      />
      <br/>
      <button onClick={handleLogin} style={{marginTop: '10px', padding: '10px', fontSize: '16px'}}>
        Войти
      </button>
      <br/>
      <Link to={'/register'}>Создать новый аккаунт</Link>
      
      <MyModal visible={isIncorrect} setVisible={setIsIncorrect}>
        Неверный логин или пароль!
      </MyModal>
    </div>
  );
};

export default Login;