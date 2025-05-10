import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportGenerating: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000); // 2-second delay for user feedback

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Submission Successful
        </h2>
        <p className="text-gray-600 mb-6">
          Your answers have been submitted. Redirecting to your dashboard...
        </p>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4" />
      </div>
    </div>
  );
};

export default ReportGenerating;