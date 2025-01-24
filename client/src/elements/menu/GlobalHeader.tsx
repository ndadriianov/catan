import {useContext, useEffect} from 'react';
import UserContext, {clearInvalidAccount} from '../../context/UserContext.ts';
import {useNavigate} from 'react-router-dom';
import socket from '../../socket.ts';

const GlobalHeader = () => {
  const {user, setUser} = useContext(UserContext)!;
  const navigate = useNavigate();
  
  
  useEffect(() => {
    if (user.username && user.password) {
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('password', user.password);
    }
  }, [user]);
  
  
  useEffect(() => {
    if (!(user.username && user.password)) {
      const storageUsername = sessionStorage.getItem('username');
      const storagePassword = sessionStorage.getItem('password');
      
      if (storageUsername && storagePassword) {
        socket.emit('login', storageUsername, storageUsername, (succeed: boolean): void => {
          if (succeed) {
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
          <button onClick={() => {
            setUser({username: undefined, password: undefined});
            navigate('/login');
            clearInvalidAccount();
          }}>
            выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalHeader;