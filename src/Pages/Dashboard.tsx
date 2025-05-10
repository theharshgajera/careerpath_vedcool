import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState('Pending');
  const [reportPath, setReportPath] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      // Fetch report status
      const reportResponse = await fetch('http://careerpath.vedcool.ai/api/auth/report-status', { headers });
      if (!reportResponse.ok) throw new Error('Failed to fetch status');
      const reportData = await reportResponse.json();
      setStatus(reportData.status);
      setReportPath(reportData.reportPath);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error');
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleDownload = async () => {
    if (!reportPath) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://careerpath.vedcool.ai/api/files/download/${reportPath}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.firstName}_report.pdf`; // Customize the filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report.');
    }
  };

  const isReportUploaded = reportPath !== null;
  const showWaitMessage = status === 'Analyzing' && !isReportUploaded;

  return (
    <div className="min-h-screen bg-gray-100" style={{ height: '100vh', width: '100vw' }}>
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Career Guidance Platform</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-900 shadow-xl rounded-2xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10" />
            <div className="relative p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome, {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-indigo-200">Track your career assessment progress</p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300 transform hover:scale-105 ${
                      isReportUploaded
                        ? 'bg-green-500 text-white'
                        : status === 'Analyzing'
                        ? 'bg-yellow-500 text-white'
                        : status === 'Error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {isReportUploaded ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Report Ready
                      </>
                    ) : status === 'Analyzing' ? (
                      <>
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Analyzing Results
                      </>
                    ) : status === 'Error' ? (
                      <>
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Processing Failed
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {status}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assessment Status</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Current Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === 'Analyzing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'Report Generated'
                        ? 'bg-green-100 text-green-800'
                        : status === 'Error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-8">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      status === 'Pending'
                        ? 'w-1/4 bg-gray-400'
                        : status === 'Analyzing'
                        ? 'w-1/2 bg-yellow-500'
                        : status === 'Report Generated'
                        ? 'w-full bg-green-500'
                        : 'w-3/4 bg-red-500' // Error case
                    }`}
                  />
                </div>
              </div>

              {showWaitMessage && (
                <div className="w-full p-6 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-800 mb-1">Your assessment is being processed!</h4>
                      <p className="text-yellow-700">
                        Your comprehensive career assessment report will be available within the next 24 hours. 
                        Please check back later.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isReportUploaded && (
                <div className="w-full p-6 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 mb-1">Your report is ready!</h4>
                      <p className="text-green-700 mb-3">
                        Your comprehensive career assessment report is available for download.
                      </p>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-indigo-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-indigo-900 mb-2">Next Steps</h4>
                <ul className="space-y-3">
                  {!isReportUploaded && (
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center">
                        <span className="text-indigo-600 text-sm font-medium">1</span>
                      </div>
                      <p className="ml-3 text-sm text-indigo-800">
                        {status === 'Error'
                          ? 'There was an issue processing your report. Please contact support.'
                          : 'Your assessment is being processed. Please wait.'}
                      </p>
                    </li>
                  )}
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-medium">
                        {isReportUploaded ? '1' : '2'}
                      </span>
                    </div>
                    <p className="ml-3 text-sm text-indigo-800">
                      {isReportUploaded
                        ? 'Download your career assessment report'
                        : 'Check back in 24 hours for your career assessment report'}
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-medium">
                        {isReportUploaded ? '2' : '3'}
                      </span>
                    </div>
                    <p className="ml-3 text-sm text-indigo-800">
                      Schedule a consultation with a career counselor for personalized guidance
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;