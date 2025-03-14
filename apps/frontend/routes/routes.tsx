import {
  createBrowserRouter,
  createRoutesFromElements,
  Route, RouterProvider,
} from 'react-router-dom';
import App from '../src/App';
import Messenger from '../src/pages/messenger';
import PrivateRoute from './PrivateRoute';
import AccessDenied from '../src/pages/accessDenied/accessDenied.tsx';
import { UserProvider } from '../src/services/userContext.tsx';
import Profile from '../src/pages/profile/profile.tsx';
import Subscriptions from '../src/pages/Subscriptions/Subscriptions.tsx';
import PaymentSuccess from '../src/pages/paymentSuccess/paymentSuccess.tsx';
import PaymentCancel from '../src/pages/paymentCancel/paymentCancel.tsx';
import { RoutePaths } from './constants/routePaths.ts';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={RoutePaths.HOME} element={<App />} />
      <Route element={<PrivateRoute />}>
        <Route path={RoutePaths.MAIN} element={<Messenger />} />
        <Route path={RoutePaths.PROFILE} element={<Profile />} />
        <Route path={RoutePaths.SUBSCRIPTIONS} element={<Subscriptions />} />
      </Route>
      <Route path={RoutePaths.ACCESS_DENIED} element={<AccessDenied />} />
      <Route path={RoutePaths.PAYMENT_SUCCESS} element={<PaymentSuccess />} />
      <Route path={RoutePaths.PAYMENT_CANCEL} element={<PaymentCancel />} />
      <Route path="*" element={<div>Not found</div>} />
    </>
  ),
  {
    basename: '/'
  }
);

const Root = () => (
  <UserProvider>
    <RouterProvider router={router} />
  </UserProvider>
);

export default Root;
