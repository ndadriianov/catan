import {useContext, useEffect, useState} from 'react';
import UserContext, {LoginStatus} from '../../context/UserContext.ts';
import {useNavigate} from 'react-router-dom';
import socket from '../../socket.ts';
import MyModal from '../UI/modal/MyModal.tsx';
import globalClasses from '../../styles.module.css'
import classes from './menu.module.css'
import RulesModal from "./RulesModal.tsx";
import {Button} from "@mui/material";

const GlobalHeader = () => {
  const {user, setUser} = useContext(UserContext)!;
  const [needAuthorizeAgain, setNeedAuthorizeAgain] = useState(false);
  const navigate = useNavigate();
  
  function LogOut(): void {
    clearInvalidAccount();
    socket.emit('logout');
  }
  function clearInvalidAccount(): void {
    setUser({username: undefined, password: undefined});
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('password');
    navigate('/login');
  }
  function Login(): void {
    if (!(user.username && user.password)) {
      const storageUsername = sessionStorage.getItem('username');
      const storagePassword = sessionStorage.getItem('password');
      
      if (storageUsername && storagePassword) {
        socket.emit('login', storageUsername, storagePassword, (status: LoginStatus): void => {
          if (status == LoginStatus.Success) {
            setUser({username: storageUsername, password: storagePassword});
          } else {
            clearInvalidAccount();
          }
        });
      } else {
        clearInvalidAccount();
      }
    }
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
    Login();
    // socket.on('check-login', Login);
  }, []);
  
  
  useEffect(() => {
    socket.on('reauthorization-required', () => {
      setNeedAuthorizeAgain(true);
      clearInvalidAccount();
    })
  }, [])
  
  
  return (
    <div style={{backgroundColor: 'skyblue'}}>
      {user.username && (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div className={classes.headerText}>{user.username}</div>

          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <RulesModal/>
            <Button onClick={LogOut} variant={'contained'}>
              выйти из аккаунта
            </Button>
          </div>
        </div>
      )}
      
      <MyModal visible={needAuthorizeAgain} setVisible={setNeedAuthorizeAgain}>
        Произошла ошибка аутентификации. Введите логин и пароль снова
      </MyModal>
    </div>
  );
};

export default GlobalHeader;