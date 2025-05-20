import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import { useUser } from '@clerk/clerk-react';
import { createParticipation } from '../services/participationService';

const JoinActivityPage = () => {
  const navigate = useNavigate();
  const { supabase: supabaseClient } = useSupabase();
  const { user } = useUser();
  const { showToast } = useToast();
  const { accessCode: codeFromPath } = useParams();
  const [searchParams] = useSearchParams();
  
  const codeFromQuery = searchParams.get('code') || '';
  const code = codeFromPath || codeFromQuery;
  
  const [accessCode, setAccessCode] = useState(code);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foundActivity, setFoundActivity] = useState(null);

  // If code is available, try to find the activity
  useEffect(() => {
    if (code && supabaseClient) {
      handleFindActivity(code);
    }
  }, [code, supabaseClient]);

  const fetchActivityById = async (activityId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError('Activity not found');
        return;
      }

      // Check if activity requires a code
      if (data.access_code && data.access_code !== accessCode) {
        setFoundActivity(null);
        setError('This activity requires an access code');
        return;
      }

      setFoundActivity(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Error finding activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindActivity = async (code = accessCode) => {
    if (!code) {
      setError('Please enter an access code');
      return;
    }

    setIsLoading(true);
    setError(null);

    if(!supabaseClient) {
      console.error('Supabase client is not initialized');
    }

    try {
      const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('access_code', code)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError('Activity not found with this code');
        return;
      }

      setFoundActivity(data);
      setAccessCode(code); // Update the access code in state
    } catch (err) {
      console.error('Error finding activity by code:', err);
      setError('Error finding activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinActivity = async () => {
    if (!foundActivity) {
      return;
    }

    try {
      // Check if the user already participated
      const { data: existingParticipation, error: participationError } = await supabaseClient
        .from('participations')
        .select('*')
        .eq('activity_id', foundActivity.id)
        .eq('user_id', user.id)
        .single();

      if (participationError && participationError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is expected if user hasn't participated yet
        throw participationError;
      }

      if (existingParticipation) {
        showToast('You have already participated in this activity', 'info');
      } else {
        // Create new participation
        await createParticipation(supabaseClient, {
          activity_id: foundActivity.id,
          user_id: user.id,
          responses: {},
          score: 0
        });
      }
      
      // Navigate to the activity details page
      navigate(`/app/activity/${foundActivity.id}`);
    } catch (err) {
      console.error('Error joining activity:', err);
      showToast('Error joining activity', 'error');
    }
  };

return (
  <div className="container mx-auto p-4 max-w-md">
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h1 className="text-2xl font-bold text-center">Join Activity</h1>
        <p className="text-center mt-2 text-sm opacity-90">
          Enter an access code or use a direct link to join an activity
        </p>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : foundActivity ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-black">{foundActivity.title}</h2>
              <p className="text-black mt-1">
                {foundActivity.activity_type.charAt(0).toUpperCase() + foundActivity.activity_type.slice(1)}
              </p>
              {foundActivity.description && (
                <p className="mt-3 text-black">{foundActivity.description}</p>
              )}
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={handleJoinActivity}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Join Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-black mb-1">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div className="flex justify-center pt-2">
              <button
                onClick={() => handleFindActivity()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Find Activity
              </button>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-sm text-black">
                Don't have a code? Browse{' '}
                <button
                  onClick={() => navigate('/app/activity/public')}
                  className="text-blue-600 hover:underline"
                >
                  public activities
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

};

export default JoinActivityPage;