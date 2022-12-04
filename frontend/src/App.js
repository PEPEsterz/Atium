import React from 'react';
import { Home } from "./components"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Savings from './components/Savings';
import Allowance from './components/Allowance';
import TrustFund from './components/TrustFund';
import Gift from './components/Gift';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path='/saving' element={<Savings/>}/>
        <Route path='/allowance' element={<Allowance/>}/>
        <Route path='/trustfund' element={<TrustFund/>}/>
        <Route path='/gift' element={<Gift/>}/>
      </Routes>
    </Router>
  );
}

export default App;
