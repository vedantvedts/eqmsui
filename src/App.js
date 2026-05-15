import './App.css';
import { Route, Routes } from 'react-router-dom';
import LoginPage from'./components/Login/login';
import Dashboard from'./components/dashboard/dashboard';
import Equipment from'./components/masters/equipment';
import EquipmentLog from './components/masters/equipmentLog';
import Make from './components/masters/make';
import Model from './components/masters/model';
import PrivateRoute from './common/privateRoute';
import Calibration from './components/masters/calibration';
import ComponentList from './components/inventory/componentlist';
import ComponentDetails from './components/inventory/componentdetails';
import UserManager from './components/admin/userManager';
import AuditStamping from './components/admin/auditStamping';



function App() {
  return (
    
    <div className="App dms-font " >
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path='/login' element={<LoginPage />}/> 
        <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/equipmentlog" element={<EquipmentLog />} />
        <Route path="/calibration" element={<Calibration />} />
        <Route path="/componentlist" element={<ComponentList />} />
        <Route path="/componentdetails" element={<ComponentDetails />} />
        <Route path="/make" element={<Make />} />
        <Route path="/model" element={<Model />} />
        <Route path="/usermanager" element={<UserManager />} />
        <Route path="/auditstamping" element={<AuditStamping />} />
        </Route>
      </Routes>
    </div>
   
  );
}

export default App;
