import {
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import App from '../src/App';
import Messenger from '../src/pages/messenger';
import PrivateRoute from './PrivateRoute';
import AccessDenied from '../src/pages/accessDenied/accessDenied.tsx';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route element={<PrivateRoute />}>
        <Route path="/main" element={<Messenger />} />
      </Route>
      <Route path={'/access-denied'} element={<AccessDenied />} />
    </>
  ),
  {
    basename: '/'
  }
);