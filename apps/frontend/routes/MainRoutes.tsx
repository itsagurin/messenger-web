import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Messenger from '../src/pages/messenger';
// @ts-ignore
import React from 'react';
// @ts-ignore
import ReactDOM from 'react-dom/client';

function Application() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<Messenger />}/>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('messenger')!).render(<Application />);