import {createContext} from 'react';

export enum LoginStatus{
  Success,
  Incorrect,
  Duplicate,
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