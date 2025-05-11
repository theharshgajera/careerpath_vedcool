import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';

interface Subject {
  subjectName: string;
  marks: string;
  totalMarks: string;
}

interface StandardEntry {
  standard: number;
  subjects: Subject[];
}

const AddMarks = () => {
  const navigate = useNavigate();
  const [standards, setStandards] = useState<StandardEntry[]>([]);
  const [currentStandard, setCurrentStandard] = useState<string>(''); // Input for new standard
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing marks on page load
  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login again');
          return;
        }
        const response = await fetch('http://api.careerpath.vedcool.ai/api/marks/marks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data: StandardEntry[] = await response.json();
          setStandards(data); // Load saved marks into state
        } else {
          const text = await response.text();
          setError(`Failed to load previous marks: ${text}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Network error while fetching marks');
      }
    };
    fetchMarks();
  }, []); // Runs on every mount, including back navigation

  // Add a new standard
  const addStandard = () => {
    const standardNum = Number(currentStandard);
    if (isNaN(standardNum) || standardNum <= 0) {
      setError('Please enter a valid standard number (e.g., 9)');
      return;
    }
    if (standards.some((s) => s.standard === standardNum)) {
      setError(`Standard ${standardNum} already exists`);
      return;
    }
    setStandards([...standards, { standard: standardNum, subjects: [] }]);
    setCurrentStandard('');
    setSuccess(`Standard ${standardNum} added`);
    setTimeout(() => setSuccess(''), 3000);
    setError('');
  };

  // Add a subject to a specific standard
  const addSubject = (standard: number) => {
    setStandards(
      standards.map((s) =>
        s.standard === standard
          ? { ...s, subjects: [...s.subjects, { subjectName: '', marks: '', totalMarks: '100' }] }
          : s
      )
    );
    setSuccess('Subject added');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Remove a subject from a specific standard
  const removeSubject = (standard: number, index: number) => {
    setStandards(
      standards.map((s) =>
        s.standard === standard
          ? { ...s, subjects: s.subjects.filter((_, i) => i !== index) }
          : s
      )
    );
  };

  // Handle input changes for subjects
  const handleInputChange = (standard: number, index: number, field: keyof Subject, value: string) => {
    setStandards(
      standards.map((s) =>
        s.standard === standard
          ? {
              ...s,
              subjects: s.subjects.map((sub, i) =>
                i === index
                  ? {
                      ...sub,
                      [field]: value,
                      ...(field === 'subjectName' && value && !sub.totalMarks ? { totalMarks: '100' } : {}),
                    }
                  : sub
              ),
            }
          : s
      )
    );
  };

  // Validate all data
  const validateForm = () => {
    for (const standard of standards) {
      if (standard.subjects.length === 0) {
        return `Standard ${standard.standard} has no subjects`;
      }
      for (const subject of standard.subjects) {
        if (!subject.subjectName.trim()) return `Subject name missing in Standard ${standard.standard}`;
        if (!subject.marks || isNaN(Number(subject.marks))) return `Invalid marks in Standard ${standard.standard}`;
        if (Number(subject.marks) > Number(subject.totalMarks))
          return `Marks exceed total in Standard ${standard.standard}`;
      }
    }
    return '';
  };

  // Save all marks to the database and navigate
  const saveAllMarks = async () => {
    setError('');
    setSuccess('');

    if (standards.length === 0) {
      setError('Please add at least one standard');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('http://api.careerpath.vedcool.ai/api/marks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(
          standards.map((s) => ({
            standard: s.standard,
            subjects: s.subjects.map((sub) => ({
              subjectName: sub.subjectName.trim(),
              marks: parseInt(sub.marks),
              totalMarks: parseInt(sub.totalMarks),
            })),
          }))
        ),
      });

      if (response.ok) {
        setSuccess('All marks saved successfully');
        setTimeout(() => {
          setSuccess('');
          navigate('/questionnaire'); // Navigate after saving
        }, 1000);
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setError(data.error || `Failed to save marks (Status: ${response.status})`);
        } catch (jsonErr) {
          console.error('Response is not JSON:', text);
          setError(`Server error (Status: ${response.status}) - Route not found or misconfigured`);
        }
      }
    } catch (err) {
      console.error('Error saving marks:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="bg-white" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-2xl rounded-b-2xl overflow-hidden p-8 sm:p-10">
          <div className="relative">
            <div className="absolute inset-0 bg-pattern opacity-10" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Academic Records</h2>
                <p className="text-indigo-100">Track your academic performance</p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-indigo-100" />
                <span className="text-indigo-50 font-medium">
                  {standards.length} {standards.length === 1 ? 'Standard' : 'Standards'} Added
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Add New Standard */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter Standard Number</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={currentStandard}
                  onChange={(e) => setCurrentStandard(e.target.value)}
                  className="block w-32 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 9"
                  min="1"
                />
                <button
                  onClick={addStandard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Standard
                </button>
              </div>
            </div>

            {/* Display All Standards */}
            {standards.map((standardData) => (
              <div key={standardData.standard} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Standard {standardData.standard}</h3>
                {standardData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="relative bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl group"
                  >
                    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-16 bg-indigo-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Subject #{index + 1}</h4>
                      {standardData.subjects.length > 1 && (
                        <button
                          onClick={() => removeSubject(standardData.standard, index)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                        <input
                          type="text"
                          value={subject.subjectName}
                          onChange={(e) =>
                            handleInputChange(standardData.standard, index, 'subjectName', e.target.value)
                          }
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter subject name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
                        <input
                          type="number"
                          value={subject.marks}
                          onChange={(e) => handleInputChange(standardData.standard, index, 'marks', e.target.value)}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="0"
                          min="0"
                          max={subject.totalMarks || '100'}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                        <input
                          type="number"
                          value={subject.totalMarks}
                          onChange={(e) =>
                            handleInputChange(standardData.standard, index, 'totalMarks', e.target.value)
                          }
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          placeholder="100"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-indigo-700">Progress</span>
                        <span className="text-sm font-medium text-indigo-700">
                          {subject.totalMarks && subject.marks
                            ? `${Math.round((Number(subject.marks) / Number(subject.totalMarks)) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="mt-2 h-3 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              subject.totalMarks && subject.marks
                                ? (Number(subject.marks) / Number(subject.totalMarks)) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addSubject(standardData.standard)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Subject
                </button>
              </div>
            ))}

            {/* Messages and Save Button */}
            {standards.length > 0 && (
              <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-300 transition-colors duration-300 shadow-sm hover:shadow-md">
                {error && (
                  <div className="mb-4 flex items-center bg-red-50 p-3 rounded-lg text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 flex items-center bg-green-50 p-3 rounded-lg text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {success}
                  </div>
                )}
                <button
                  onClick={saveAllMarks}
                  className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Save All Marks
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMarks;