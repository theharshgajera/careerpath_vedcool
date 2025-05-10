import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    schoolName: '',
    standard: '',
    age: '',
    interests: '',
    academicPerformance: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(formData);
      navigate('/add-marks');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      className="bg-gray-50 flex items-start md:items-center justify-center overflow-y-auto"
      style={{ minHeight: '100vh' }}
    >
      <div className="bg-gray-100 flex flex-col rounded-2xl shadow-lg w-full max-w-4xl mx-auto p-4 md:p-5 items-center my-4">
        <div className="flex flex-col items-center mb-4 mt-2">
          <div className="p-2 sm:p-3 bg-blue-600 rounded-2xl shadow-lg">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#002D74] mt-2 text-center">Signup for Career Guide</h2>
          <p className="text-xs text-[#002D74] text-center">Fill in your details to get started</p>
        </div>

        <form className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full px-2 md:px-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          </div>

          <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
          <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="text" name="schoolName" placeholder="School Name" value={formData.schoolName} onChange={handleChange} required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="text" name="standard" placeholder="Standard" value={formData.standard} onChange={handleChange} required />
            <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="number" name="age" placeholder="Age" min="13" max="25" value={formData.age} onChange={handleChange} required />
          </div>

          <textarea className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" name="interests" placeholder="Interests (e.g., Psychology, Literature, Media Studies)" value={formData.interests} onChange={handleChange} rows={2} required />
          <input className="p-2 rounded-xl border w-full text-xs sm:text-sm md:text-base" type="text" name="academicPerformance" placeholder="Academic Performance (e.g., 88% aggregate)" value={formData.academicPerformance} onChange={handleChange} required />

          {error && <p className="text-red-500 text-xs sm:text-sm text-center">{error}</p>}

          <button type="submit" className="bg-[#002D74] rounded-xl text-white py-1.5 sm:py-2 hover:scale-105 duration-300 w-full text-xs sm:text-sm md:text-base" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-2 mb-2 text-xs flex justify-between items-center text-[#002D74] w-full px-2 md:px-6">
          <p className="text-xs">Already have an account?</p>
          <Link to="/login">
            <button className="py-1.5 px-3 sm:py-2 sm:px-4 bg-white border rounded-xl hover:scale-110 duration-300 text-xs sm:text-sm">Login</button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Signup;