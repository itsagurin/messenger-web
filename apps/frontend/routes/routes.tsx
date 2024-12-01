import {
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import App from '../src/App';
import Messenger from '../src/pages/messenger';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route path="/main" element={<Messenger />} />
    </>
  ),
  {
    basename: '/'
  }
);