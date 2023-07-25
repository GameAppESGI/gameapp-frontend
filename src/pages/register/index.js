import React from 'react'
import { Link } from 'react-router-dom';
import { RegisterUser } from '../../api-calls/users';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShowLoader, HideLoader } from '../../redux/loaderSlice';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = React.useState({
    name: '',
    email: '',
    password: '',
  })

  const registerUser = async () => {
    try {
      dispatch(ShowLoader());
      const response = await RegisterUser(user);
      dispatch(HideLoader());
      if(response.success) {
        toast.success(response.message);
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
      navigate("/home");
    }
  }, []);
  
  return (
    <div className='h-screen flex items-center justify-center' id="register">
      <div className='bg-white shadow-md p-3 rounded-xl flex flex-col gap-4 w-96'>
        <h1 className='text-3xl font-bold uppercase'>GameApp Register</h1>
        <hr />
        <input type="text"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder='Enter your name' />
        <input type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder='Enter your email' />
        <input type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder='Enter your password' />

        <button className='contained-btn' onClick={registerUser}>Register</button>
        <Link
          to="/login"
          className="underline"
        >
          Already an account ? Login
        </Link>
      </div>
    </div>
  );
}

export default Register