import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      dispatch(signInFailure('Email and password are required'));
      return;
    }

    try {
      dispatch(signInStart());

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get('Content-Type');

      // Prevent parsing error if server returns HTML
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await res.text();
        console.error('Server returned non-JSON:', errorText);
        throw new Error('Invalid server response (not JSON)');
      }

      const data = await res.json();

      if (!res.ok) {
        dispatch(signInFailure(data.message || 'Login failed'));
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message || 'Something went wrong'));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth />
      </form>

      <div className="flex gap-2 mt-5 text-sm">
        <p>Dont have an account?</p>
        <Link to="/sign-up" className="text-blue-700 hover:underline">
          Sign up
        </Link>
      </div>

      {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
    </div>
  );
}
