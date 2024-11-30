import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Messenger from '../src/pages/messenger';
// @ts-ignore
import React from 'react';
// @ts-ignore
import ReactDOM from 'react-dom/client';

function Application() {
  return (
    <Routes>
      <Route path="/main" element={<Messenger />}/>
    </Routes>
  );
}

const rootElement = document.getElementById('messenger');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Application />);
}