import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import { LoginUser } from '../../api-calls/users';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HideLoader, ShowLoader } from '../../redux/loaderSlice';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = React.useState({
    email: '',
    password: '',
  });

  const loginUser = async () => {
    try {
      dispatch(ShowLoader());
      const response = await LoginUser(user);
      dispatch(HideLoader());
      if(response.success) {
        toast.success(response.message);
        localStorage.setItem("token",response.data);
        window.location.href = "/";
      }
      else {
        toast.error(response.message);
      }
    } catch(error) {
      toast.error(error.message);
      dispatch(HideLoader());
    }
  };

  useEffect(() => {
    if(localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  return (
    <div className='h-screen flex items-center justify-center' id="login">
      <div className='bg-white shadow-md p-3 rounded-xl flex flex-col gap-4 w-96' id="loginCard">
        <h1 className='text-3xl font-bold uppercase'>GameApp Login</h1>
        <hr />
        <input type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder='Enter your email' />
        <input type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder='Enter your password' />

        <button className='contained-btn' onClick={loginUser}>Login</button>
        <Link to="/register" className="underline">Dont have an account? Register</Link>
      </div>
    </div>
  );
}

export default Login