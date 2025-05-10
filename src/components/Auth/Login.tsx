import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      
      // Fetch report status after login
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://careerpath.vedcool.ai/api'}/questionnaire/report-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch report status');
      }

      const statusData = await response.json();

      // Redirect based on report status
      if (statusData.status === 'Report Generated') {
        navigate('/dashboard');
      } else {
        navigate('/add-marks');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Invalid email or password');
      } else if (err.request) {
        setError('Unable to connect to server. Please try again.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center" style={{ width: '100vw', height: '100vh' }}>
      <div className="bg-gray-100 flex flex-col rounded-2xl shadow-lg max-w-md w-full mx-4 p-8 items-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="font-bold text-2xl text-[#002D74] text-center">Login to Your Career Guide</h2>
        <p className="text-xs mt-4 text-[#002D74] text-center">
          Access your personalized career guidance and resources
        </p>

        <form className="flex flex-col gap-4 mt-6 w-full" onSubmit={handleSubmit}>
          <input
            className="p-2 rounded-xl border w-full"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              className="p-2 rounded-xl border w-full"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-xs flex justify-between items-center text-[#002D74]">
          <p>Don't have an account?</p>
          <Link to="/signup">
            <button className="py-2 px-5 bg-white border rounded-xl hover:scale-110 duration-300">
              Register
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Login;