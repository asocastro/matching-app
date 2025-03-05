import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const userType = user.user_type || 'Not Set';
  const isProfileComplete = user.is_profile_complete || false;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}!</h2>
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-medium">Account Type:</span> {userType}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Profile Status:</span>{' '}
            {isProfileComplete ? 'Complete' : 'Incomplete'}
          </p>
        </div>

        {!isProfileComplete && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your profile is incomplete. Please complete your profile to get better matches.
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Update Profile
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              View Matches
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Activity Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Profile Views:</span> 0
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Matches:</span> 0
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Last Login:</span> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;