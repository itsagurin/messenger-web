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

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route element={<PrivateRoute />}>
        <Route path="/main" element={<Messenger />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
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
