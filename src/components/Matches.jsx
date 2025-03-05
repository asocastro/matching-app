import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Matches = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }

    if (user && user.user_type) {
      fetchMatches();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading, navigate]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/matches');
      setMatches(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, generate mock matches if no backend is available
  useEffect(() => {
    if (!loading && user && matches.length === 0 && !isLoading) {
      const mockMatches = generateMockMatches(user.user_type);
      setMatches(mockMatches);
    }
  }, [isLoading, user, loading, matches.length]);

  const generateMockMatches = (userType) => {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
    const locations = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const matchType = userType === 'seeker' ? 'provider' : 'seeker';
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      return {
        id: `mock-${i}`,
        name: `${matchType === 'provider' ? 'Provider' : 'Seeker'} ${i + 1}`,
        user_type: matchType,
        industry,
        location,
        match_score: Math.floor(Math.random() * 40) + 60, // 60-100
        services: matchType === 'provider' ? 'Consulting, Development, Support' : null,
        credit_rating: matchType === 'seeker' ? ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] : null,
        bio: `This is a mock ${matchType} profile for demonstration purposes.`
      };
    });
  };

  if (loading || (isLoading && !error)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Matches</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!user.user_type) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Matches</h1>
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          Please complete your profile to see matches.
          <div className="mt-4">
            <button
              onClick={() => navigate('/profile')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      
      {matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No matches found. Try updating your profile to improve matching.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{match.name}</h2>
                    <p className="text-gray-600 capitalize">{match.user_type}</p>
                  </div>
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {match.match_score}% Match
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Industry:</span> {match.industry}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Location:</span> {match.location}
                    </p>
                    {match.user_type === 'provider' && (
                      <p className="text-gray-700">
                        <span className="font-medium">Services:</span> {match.services}
                      </p>
                    )}
                    {match.user_type === 'seeker' && (
                      <p className="text-gray-700">
                        <span className="font-medium">Credit Rating:</span> {match.credit_rating}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Bio:</span>
                    </p>
                    <p className="text-gray-600">{match.bio}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mr-2">
                    Contact
                  </button>
                  <button className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;