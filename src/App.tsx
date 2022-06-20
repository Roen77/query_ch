import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import loadable from '@loadable/component'


const Login = loadable(() => import('./pages/Login'))
const Signup = loadable(() => import('./pages/Signup'))

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/workspace/:workspace/*' element={<Login/>}></Route>
    </Routes>
  );
}

export default App;
