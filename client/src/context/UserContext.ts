import {createContext} from 'react';

export function clearInvalidAccount(): void {
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('password');
}

export type User = {
  username?: string;
  password?: string;
}

interface UserContextType {
  user: User;
  setUser: (value: User) => void;
}

const UserContext = createContext<UserContextType|undefined>(undefined);

export default UserContext;