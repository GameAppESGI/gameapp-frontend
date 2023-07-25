import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { useSelector } from 'react-redux';
import Loader from "./components/Loader"
import {Profile} from "./pages/profile";

function App() {
  const {loader} = useSelector(state => state.loaderReducer);
  return (
    <div className="h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      {loader && <Loader/>}
      <BrowserRouter>
      <Routes>
          <Route path="/" element={(<ProtectedRoute><Home/></ProtectedRoute>)}/>
          <Route path="/profile" element={(<ProtectedRoute><Profile/></ProtectedRoute>)}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
