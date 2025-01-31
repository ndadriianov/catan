import {useContext, useEffect} from 'react';
import UserContext, {clearInvalidAccount, LoginStatus} from '../../context/UserContext.ts';
import {useNavigate} from 'react-router-dom';
import socket from '../../socket.ts';

const GlobalHeader = () => {
  const {user, setUser} = useContext(UserContext)!;
  const navigate = useNavigate();
  
  function LogOut(): void {
    setUser({username: undefined, password: undefined});
    navigate('/login');
    clearInvalidAccount();
    socket.emit('logout');
  }
  
  // сохранение логина и пароля в sessionStorage чтобы они не слетели при перезагрузке страницы
  useEffect(() => {
    if (user.username && user.password) {
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('password', user.password);
    }
  }, [user]);
  
  
  // попытка авторизации при перезагрузке страницы
  useEffect(() => {
    if (!(user.username && user.password)) {
      const storageUsername = sessionStorage.getItem('username');
      const storagePassword = sessionStorage.getItem('password');
      
      if (storageUsername && storagePassword) {
        socket.emit('login', storageUsername, storageUsername, (status: LoginStatus): void => {
          if (status == LoginStatus.Success) {
            setUser({username: storageUsername, password: storagePassword});
          } else {
            clearInvalidAccount();
            navigate('/login');
          }
        });
      }
    }
  }, []);
  
  
  return (
    <div>
      {user.username && (
        <div>
          <p>{user.username}</p>
          <button onClick={LogOut}>
            выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalHeader;