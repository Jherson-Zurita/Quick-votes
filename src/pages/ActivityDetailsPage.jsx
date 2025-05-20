import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import { QuizPlayer } from '../components/quiz/QuizPlayer';
import { WheelPlayer } from '../components/wheel/WheelPlayer';
import { RafflePlayer } from '../components/raffle/RafflePlayer';
import { VotingPlayer } from '../components/voting/VotingPlayer';
import { QuizResults } from '../components/quiz/QuizResults';
import { VotingResults } from '../components/voting/VotingResults';
import { RaffleResults } from '../components/raffle/RaffleResults';
import { formatDate } from '../lib/utils';
import { useUser } from '@clerk/clerk-react';
import ActivityLobby from '../components/activities/ActivityLobby';

const ActivityDetailsPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { supabase: supabaseClient } = useSupabase();
  const { user } = useUser();
  const { showToast } = useToast();
  
  const [activity, setActivity] = useState(null);
  const [activityItems, setActivityItems] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('details'); // details, lobby, play, results
  const [userParticipation, setUserParticipation] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activityStatus, setActivityStatus] = useState('pending'); // pending, started, ended
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        // Solo establecer isLoading = true si es la carga inicial
        if (!isInitialLoadComplete) {
          setIsLoading(true);
        }
        
        // Fetch activity
        const { data: activityData, error: activityError } = await supabaseClient
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
        
        if (activityError) throw activityError;
        if (!activityData) throw new Error('Activity not found');
        
        // Determine updated status considering expires_at
        let currentStatus = activityData.state || 'pending';
        const now = new Date();
    
        if (activityData.expires_at && new Date(activityData.expires_at) < now) {
          currentStatus = 'ended';
          // Optional: Update in DB if different
          if (activityData.state !== 'ended') {
            await supabaseClient
              .from('activities')
              .update({ state: 'ended' })
              .eq('id', activityId);
          }
        }   

        setActivity(activityData);
        setActivityStatus(currentStatus);
        setIsOwner(activityData.user_id === user?.id);
        
        // Fetch activity items
        const { data: itemsData, error: itemsError } = await supabaseClient
          .from('activity_items')
          .select('*')
          .eq('activity_id', activityId)
          .order('position', { ascending: true });
        
        if (itemsError) throw itemsError;
        setActivityItems(itemsData || []);
        
        // Fetch participations
        const { data: participationsData, error: participationsError } = await supabaseClient
          .from('participations')
          .select('*, profiles:user_id(username, display_name, avatar_url)')
          .eq('activity_id', activityId);
        
        if (participationsError) throw participationsError;
        setParticipations(participationsData || []);
        
        // Check if current user has participated
        const userParticipation = participationsData?.find(p => p.user_id === user?.id);
        setUserParticipation(userParticipation || null);
        
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError(err.message);
        showToast('Error loading activity', 'error');
      } finally {
        setIsLoading(false);
        setIsInitialLoadComplete(true);
      }
    };
    
    if (activityId) {
      fetchActivityData();
    }
  }, [activityId, supabaseClient, user, showToast]);

  const handleStartActivity = async () => {
    try {
      await supabaseClient
        .from('activities')
        .update({ state: 'started' })
        .eq('id', activityId);
      setActivityStatus('started');
      showToast('Activity started successfully', 'success');
    } catch {
      showToast('Error starting activity', 'error');
    }
  };

  const handleFinishActivity = async () => {
    try {
      await supabaseClient
        .from('activities')
        .update({ state: 'ended' })
        .eq('id', activityId);
      setActivityStatus('ended');
      showToast('Activity ended successfully', 'success');
      setTab('results');
    } catch {
      showToast('Error finishing activity', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabaseClient
        .from('activities')
        .delete()
        .eq('id', activityId);
      
      if (error) throw error;
      
      showToast('Activity deleted successfully', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Error deleting activity:', err);
      showToast('Error deleting activity', 'error');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.description,
        url: url
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url)
        .then(() => showToast('Link copied to clipboard', 'success'))
        .catch(err => {
          console.error('Could not copy text:', err);
          showToast('Failed to copy link', 'error');
        });
    }
  };

  const togglePublic = async () => {
    try {
      const { error } = await supabaseClient
        .from('activities')
        .update({ is_public: !activity.is_public })
        .eq('id', activityId);
      
      if (error) throw error;
      
      setActivity({ ...activity, is_public: !activity.is_public });
      showToast(`Activity is now ${!activity.is_public ? 'public' : 'private'}`, 'success');
    } catch (err) {
      console.error('Error updating activity visibility:', err);
      showToast('Error updating visibility', 'error');
    }
  };

  // Solo mostrar el loader durante la carga inicial, no cuando se cambie entre tabs
  if (isLoading && !isInitialLoadComplete) return <Loader />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-xl font-bold text-red-600">Error loading activity</h1>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/app/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const renderActivityPlayer = () => {
    if (!activity) return null;

    switch (activity.activity_type) {
      case 'quiz':
        return <QuizPlayer activityId={activity.id} />;
      case 'wheel':
        return <WheelPlayer activityId={activity.id} />;
      case 'raffle':
        return <RafflePlayer activityId={activity.id} />;
      case 'vote':
        return <VotingPlayer activityId={activity.id} />;
      default:
        return <p>Unsupported activity type: {activity.activity_type}</p>;
    }
  };

  const renderResults = () => {
    if (!activity) return null;
    switch (activity.activity_type) {
      case 'quiz':
        return <QuizResults activityId={activity.id} />;
      case 'vote':
        return <VotingResults activityId={activity.id} />;
      case 'raffle':
        return <RaffleResults activityId={activity.id} />;
      case 'wheel':
        return (
          <div className="text-center p-4">
            <p class="text-black">Los resultados de la ruleta se muestran en tiempo real durante el juego.</p>
            <button
              onClick={() => setTab('play')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Wheel
            </button>
          </div>
        );
      default:
        return <p>No results available for this activity type.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Activity Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{activity.title}</h1>
            <div className="flex space-x-2">
              {isOwner && (
                <>
                  <button 
                    onClick={handleDelete}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
              <button 
                onClick={handleShare}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                Share
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm opacity-80">
            {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)}
            {activity.created_at && ` • Created: ${formatDate(activity.created_at)}`}
            {activity.expires_at && ` • ${new Date(activity.expires_at) > new Date() ? 'Expires' : 'Expired'}: ${formatDate(activity.expires_at)}`}
            {` • ${activity.is_public ? 'Public' : 'Private'}`}
            {` • Status: ${activityStatus.charAt(0).toUpperCase() + activityStatus.slice(1)}`}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setTab('details')}
            className={`flex-1 py-3 font-medium text-sm ${tab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Details
          </button>
          <button
            onClick={() => setTab('lobby')}
            className={`flex-1 py-3 font-medium text-sm ${tab === 'lobby' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Lobby
          </button>
          {activityStatus === 'started' && (
            <button
              onClick={() => setTab('play')}
              className={`flex-1 py-3 font-medium text-sm ${tab === 'play' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Play
            </button>
          )}
          {(activityStatus === 'ended' || isOwner) && (
            <button
              onClick={() => setTab('results')}
              className={`flex-1 py-3 font-medium text-sm ${tab === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Results
            </button>
          )}
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {tab === 'details' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">Description</h2>
                <p className="mt-1 text-gray-700 dark:text-gray-400">{activity.description || 'No description provided.'}</p>
              </div>

              {activity.access_code && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">Access Code</h2>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 font-mono bg-gray-200 dark:bg-gray-700 p-2 rounded">{activity.access_code}</p>
                </div>
              )}

              {isOwner && (
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">Admin Controls</h2>
                  <div className="mt-2 space-y-2">
                    <button 
                      onClick={togglePublic}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-800 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-900"
                    >
                      Make {activity.is_public ? 'Private' : 'Public'}
                    </button>
              
                    <div className="mt-4">
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-300">Participation Stats</h3>
                      <p className="text-gray-700 dark:text-gray-400">Total participants: {participations.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}          

          
          {tab === 'lobby' && (
            <ActivityLobby 
              activity={activity}
              isOwner={isOwner}
              participations={participations}
              onStartActivity={handleStartActivity}
              onFinishActivity={handleFinishActivity}
              activityStatus={activityStatus}
              onNavigate={setTab}
            />
          )}
          
          {tab === 'play' && renderActivityPlayer()}
          
          {tab === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsPage;