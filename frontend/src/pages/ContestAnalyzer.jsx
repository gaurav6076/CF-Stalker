import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../components/ThemeToggle';
import StatisticsCharts from '../components/StatisticsCharts';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function ContestAnalyzer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [contestData, setContestData] = useState({
    div1: { contests: [], problemsByRating: {}, problemsByTopic: {}, isLoaded: false },
    div2: { contests: [], problemsByRating: {}, problemsByTopic: {}, isLoaded: false },
    div3: { contests: [], problemsByRating: {}, problemsByTopic: {}, isLoaded: false },
    div4: { contests: [], problemsByRating: {}, problemsByTopic: {}, isLoaded: false }
  });
  const [activeDivision, setActiveDivision] = useState('div2');
  const [activeTab, setActiveTab] = useState('contests'); // 'contests', 'rating', 'topics', 'statistics'
  const [expandedRatings, setExpandedRatings] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  useEffect(() => {
    // Only fetch data if the division hasn't been loaded yet
    if (!contestData[activeDivision].isLoaded) {
      fetchContestData();
    } else {
      setLoading(false);
    }
  }, [activeDivision]);

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await delay(RETRY_DELAY);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  const fetchContestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch contests from our backend
      const contests = await fetchWithRetry(`${API_BASE_URL}/api/contests/${activeDivision}`);
      
      // Update contests for the active division
      setContestData(prevData => ({
        ...prevData,
        [activeDivision]: {
          ...prevData[activeDivision],
          contests: contests
        }
      }));
      
      // Fetch problems by rating and topic
      await fetchProblemsData(activeDivision);
      
      // Mark the division as loaded
      setContestData(prevData => ({
        ...prevData,
        [activeDivision]: {
          ...prevData[activeDivision],
          isLoaded: true
        }
      }));
      
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      console.error('Error fetching contest data:', err);
      setError(
        'Failed to connect to the server. Please make sure the backend server is running and try again.'
      );
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchContestData(), RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemsData = async (division) => {
    try {
      // Fetch problems by rating
      const problemsByRating = await fetchWithRetry(`${API_BASE_URL}/api/problems/rating/${division}`);
      
      // Fetch problems by topic
      const problemsByTopic = await fetchWithRetry(`${API_BASE_URL}/api/problems/topics/${division}`);
      
      // Update the state with the fetched data
      setContestData(prevData => ({
        ...prevData,
        [division]: {
          ...prevData[division],
          problemsByRating: problemsByRating.reduce((acc, item) => {
            acc[item.rating] = item.problems;
            return acc;
          }, {}),
          problemsByTopic: problemsByTopic.reduce((acc, item) => {
            acc[item.topic] = item.problems;
            return acc;
          }, {})
        }
      }));
      
    } catch (err) {
      console.error('Error fetching problems:', err);
      throw new Error('Failed to load problem data. The data may be incomplete.');
    }
  };

  const toggleRating = (rating) => {
    setExpandedRatings(prev => ({
      ...prev,
      [rating]: !prev[rating]
    }));
  };

  const toggleTopic = (topic) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const renderContestsTab = () => {
    const contests = contestData[activeDivision].contests;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-700 dark:bg-gray-600 text-cf-text dark:text-cf-text-light">
              <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">#</th>
              <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Contest Name</th>
              <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Date</th>
              <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Problems</th>
            </tr>
          </thead>
          <tbody>
            {contests.length > 0 ? (
              contests.map((contest, index) => (
                <tr key={contest.id} className="hover:bg-gray-600 dark:hover:bg-gray-500 text-cf-text dark:text-cf-text-light">
                  <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">{index + 1}</td>
                  <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                    <a
                      href={`https://codeforces.com/contest/${contest.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cf-blue dark:text-cf-blue-light hover:underline"
                    >
                      {contest.name}
                    </a>
                  </td>
                  <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                    {new Date(contest.startTimeSeconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                    <a
                      href={`https://codeforces.com/contest/${contest.id}/problems`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cf-blue dark:text-cf-blue-light hover:underline"
                    >
                      View Problems
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-2 sm:px-4 py-2 text-center text-cf-text dark:text-cf-text-light">
                  No contests found for this division.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRatingTab = () => {
    const problemsByRating = contestData[activeDivision].problemsByRating;
    const ratings = Object.keys(problemsByRating).sort((a, b) => a - b);
    
    return (
      <div className="space-y-4">
        {ratings.length > 0 ? (
          ratings.map(rating => (
            <div key={rating} className="bg-cf-dark dark:bg-cf-dark-light rounded-lg shadow-cf">
              <button
                onClick={() => toggleRating(rating)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-t-lg"
              >
                <h3 className="text-lg font-bold text-cf-blue dark:text-cf-blue-light">
                  Rating {rating} ({problemsByRating[rating].length} problems)
                </h3>
                {expandedRatings[rating] ? (
                  <ChevronUpIcon className="h-5 w-5 text-cf-blue dark:text-cf-blue-light" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-cf-blue dark:text-cf-blue-light" />
                )}
              </button>
              
              {expandedRatings[rating] && (
                <div className="p-4 border-t border-cf-gray dark:border-cf-gray-light">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-700 dark:bg-gray-600 text-cf-text dark:text-cf-text-light">
                          <th className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">Problem</th>
                          <th className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">Contest</th>
                          <th className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">Topics</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problemsByRating[rating].map((problem, index) => (
                          <tr key={`${problem.contestId}-${problem.index}`} className="hover:bg-gray-600 dark:hover:bg-gray-500 text-cf-text dark:text-cf-text-light">
                            <td className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">
                              <a
                                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.id.split('-')[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cf-blue dark:text-cf-blue-light hover:underline"
                              >
                                {problem.name}
                              </a>
                            </td>
                            <td className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">
                              <a
                                href={`https://codeforces.com/contest/${problem.contestId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cf-blue dark:text-cf-blue-light hover:underline"
                              >
                                {problem.contestName}
                              </a>
                            </td>
                            <td className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">
                              {problem.tags && problem.tags.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-cf-text dark:text-cf-text-light py-4">
            No problems found for this division.
          </div>
        )}
      </div>
    );
  };

  const renderTopicsTab = () => {
    const problemsByTopic = contestData[activeDivision].problemsByTopic;
    const topics = Object.keys(problemsByTopic).sort();
    
    return (
      <div className="space-y-4">
        {topics.length > 0 ? (
          topics.map(topic => (
            <div key={topic} className="bg-cf-dark dark:bg-cf-dark-light rounded-lg shadow-cf">
              <button
                onClick={() => toggleTopic(topic)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-t-lg"
              >
                <h3 className="text-lg font-bold text-cf-blue dark:text-cf-blue-light">
                  {topic} ({problemsByTopic[topic].length} problems)
                </h3>
                {expandedTopics[topic] ? (
                  <ChevronUpIcon className="h-5 w-5 text-cf-blue dark:text-cf-blue-light" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-cf-blue dark:text-cf-blue-light" />
                )}
              </button>
              
              {expandedTopics[topic] && (
                <div className="p-4 border-t border-cf-gray dark:border-cf-gray-light">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-700 dark:bg-gray-600 text-cf-text dark:text-cf-text-light">
                          <th className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">Problem</th>
                          <th className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">Rating</th>
                          <th className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">Contest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problemsByTopic[topic].map((problem, index) => (
                          <tr key={`${problem.contestId}-${problem.index}`} className="hover:bg-gray-600 dark:hover:bg-gray-500 text-cf-text dark:text-cf-text-light">
                            <td className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">
                              <a
                                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.id.split('-')[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cf-blue dark:text-cf-blue-light hover:underline"
                              >
                                {problem.name}
                              </a>
                            </td>
                            <td className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">
                              {problem.rating || 'N/A'}
                            </td>
                            <td className="px-2 py-2 border border-cf-gray dark:border-cf-gray-light">
                              <a
                                href={`https://codeforces.com/contest/${problem.contestId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cf-blue dark:text-cf-blue-light hover:underline"
                              >
                                {problem.contestName}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-cf-text dark:text-cf-text-light py-4">
            No problems found for this division.
          </div>
        )}
      </div>
    );
  };

  const renderStatisticsTab = () => {
    const problemsByRating = contestData[activeDivision].problemsByRating;
    const problemsByTopic = contestData[activeDivision].problemsByTopic;
    
    // Calculate statistics
    const ratingStats = Object.entries(problemsByRating).map(([rating, problems]) => ({
      rating,
      count: problems.length
    })).sort((a, b) => a.rating - b.rating);
    
    const topicStats = Object.entries(problemsByTopic).map(([topic, problems]) => ({
      topic,
      count: problems.length
    })).sort((a, b) => b.count - a.count);
    
    return (
      <div className="space-y-6">
        {/* Charts Section */}
        <StatisticsCharts 
          problemsByRating={problemsByRating} 
          problemsByTopic={problemsByTopic} 
        />
        
        {/* Overall Statistics */}
        <div className="bg-cf-dark dark:bg-cf-dark-light rounded-lg p-4 shadow-cf">
          <h3 className="text-lg font-bold text-cf-blue dark:text-cf-blue-light mb-4">Overall Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-700 dark:bg-gray-600 rounded p-3 text-center">
              <div className="text-cf-blue dark:text-cf-blue-light font-semibold">Total Contests</div>
              <div className="text-cf-text dark:text-cf-text-light">{contestData[activeDivision].contests.length}</div>
            </div>
            <div className="bg-gray-700 dark:bg-gray-600 rounded p-3 text-center">
              <div className="text-cf-blue dark:text-cf-blue-light font-semibold">Total Problems</div>
              <div className="text-cf-text dark:text-cf-text-light">
                {Object.values(problemsByRating).reduce((sum, problems) => sum + problems.length, 0)}
              </div>
            </div>
            <div className="bg-gray-700 dark:bg-gray-600 rounded p-3 text-center">
              <div className="text-cf-blue dark:text-cf-blue-light font-semibold">Unique Topics</div>
              <div className="text-cf-text dark:text-cf-text-light">{Object.keys(problemsByTopic).length}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cf-text dark:text-cf-text-light">
        <div className="text-center">
          <div className="text-xl mb-4">Loading contest data...</div>
          <div className="text-sm">This may take a few minutes as we fetch data for multiple contests.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cf-text dark:text-cf-text-light">
        <div className="text-center">
          <div className="text-xl mb-4 text-red-500">{error}</div>
          <button 
            onClick={fetchContestData}
            className="px-4 py-2 bg-cf-blue dark:bg-cf-blue-light text-white rounded hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cf-dark dark:bg-cf-dark-light">
      <nav className="bg-cf-dark dark:bg-cf-dark-light border-b border-cf-gray dark:border-cf-gray-light">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-4">
              <span className="text-cf-blue dark:text-cf-blue-light font-bold text-lg sm:text-xl">CF Stalker</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-4 sm:mt-8 px-4 sm:px-0">
        <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg p-4 sm:p-6 shadow-cf">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold text-cf-blue dark:text-cf-blue-light">
                Contest Analyzer
              </h2>
            </div>
            <Link 
              to="/" 
              className="text-cf-blue dark:text-cf-blue-light hover:underline text-sm sm:text-base"
            >
              Back to Home
            </Link>
          </div>

          {/* Division Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['div1', 'div2', 'div3', 'div4'].map(div => (
              <button 
                key={div}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base ${
                  activeDivision === div 
                    ? 'bg-cf-blue dark:bg-cf-blue-light text-white' 
                    : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
                } hover:bg-opacity-90 transition-colors`}
                onClick={() => setActiveDivision(div)}
              >
                {div.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['contests', 'rating', 'topics', 'statistics'].map(tab => (
              <button 
                key={tab}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base ${
                  activeTab === tab 
                    ? 'bg-cf-blue dark:bg-cf-blue-light text-white' 
                    : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
                } hover:bg-opacity-90 transition-colors`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'contests' && renderContestsTab()}
          {activeTab === 'rating' && renderRatingTab()}
          {activeTab === 'topics' && renderTopicsTab()}
          {activeTab === 'statistics' && renderStatisticsTab()}
        </div>
      </div>
    </div>
  );
}

export default ContestAnalyzer; 