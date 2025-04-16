import './main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter, Route, Routes } from "react-router";
import ThemeProvider from './context/ThemeProvider';
import Login from "./login/Login";
import Landing from "./landing/Landing";
import Home from "./homePathComponents/home/Home";
import Register from './register/Register';
import Layout from './layout/Layout';
import NotFound404 from './not-found-404/NotFound404';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="*" element={<NotFound404 />} />
            <Route path="home" >
              <Route index element={<Home />} />
            </Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
