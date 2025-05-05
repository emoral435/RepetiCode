import './main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import { initializeApp } from 'firebase/app';

import config from './lib/firebaseconfig';
import ThemeProvider from './context/ThemeProvider';
import Login from "./rootPathComponents/login/Login";
import Landing from "./rootPathComponents/landing/Landing";
import Home from "./homePathComponents/home/Home";
import Register from './rootPathComponents/register/Register';
import Layout from './rootPathComponents/layout/Layout';
import NotFound404 from './rootPathComponents/not-found-404/NotFound404';
import AuthContextProvider from './context/AuthContextProvider';
import HomeLayout from './homePathComponents/homeLayout/HomeLayout';
import Profile from './homePathComponents/profile/Profile';
import Workouts from './homePathComponents/workouts/Workouts';
import RoutineHandler from './homePathComponents/routines/Routines';

initializeApp(config);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Layout />} >
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<NotFound404 />} />
              <Route path="home" element={<HomeLayout />} >
                <Route index element={<Home />} />
                <Route path="profile" element={<Profile />} />
                <Route path="workouts" element={<Workouts />} />
                <Route path="workouts/:slug" element={<RoutineHandler />} />
              </Route>
            </Route>
          </Routes>
        </AuthContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
