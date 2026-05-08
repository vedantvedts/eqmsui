import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const usertoken  = JSON.parse(localStorage.getItem('user'));

  return usertoken?.token  ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
