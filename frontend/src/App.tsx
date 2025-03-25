import { BrowserRouter, Route, Routes } from "react-router";
import './App.css'
import Login from "./login/Login";
import Landing from "./landing/Landing";
import Home from "./home/Home";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
