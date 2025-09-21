import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import AnimatedLogo from './components/Logo'
import { Component } from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<AnimatedLogo />} />
      </Routes>
    </Router>
  );
}

export default App;
