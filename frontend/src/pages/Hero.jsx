import React, { useContext, useState } from 'react';
import { HeroContext } from './HeroLayout';
import { Link } from 'react-router-dom';
import StatisticsCharts from '../components/StatisticsCharts';

function Hero() {
  const {
    userInfo,
    solvedProblems,
    topicProblems,
    unsolvedProblems,
    selectedRating,
    setSelectedRating,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sortOrder,
    setSortOrder,
    showDateInputs,
    setShowDateInputs
  } = useContext(HeroContext);

  const [activeTab, setActiveTab] = useState('statistics');

  const filterByDate = (problems) => {
    if (!fromDate || !toDate) return problems;
    const fromTimestamp = new Date(fromDate).getTime();
    const toTimestamp = new Date(toDate).getTime();
    return problems.filter(problem => problem.time >= fromTimestamp && problem.time <= toTimestamp);
  };

  const sortProblems = (problems) => {
    return [...problems].sort((a, b) =>
      sortOrder === 'asc' ? a.time - b.time : b.time - a.time
    );
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cf-text">
        Loading...
      </div>
    );
  }

  const problemsToShow =
    selectedRating && solvedProblems[selectedRating]
      ? sortProblems(filterByDate(solvedProblems[selectedRating]))
      : [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'statistics':
        return (
          <div className="mt-6 sm:mt-8 space-y-6">
            <StatisticsCharts 
              problemsByRating={solvedProblems}
              problemsByTopic={topicProblems}
            />
          </div>
        );
      case 'rating':
        return (
          <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg p-4 sm:p-6 shadow-cf">
            <h2 className="text-xl sm:text-2xl font-bold text-cf-blue dark:text-cf-blue-light mb-4">Solved Problems by Rating</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(solvedProblems)
                .sort((a, b) => a - b)
                .map((rating) => (
                  <button 
                    key={rating} 
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base ${
                      selectedRating === rating 
                        ? 'bg-cf-blue dark:bg-cf-blue-light text-white' 
                        : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
                    } hover:bg-opacity-90 transition-colors`}
                    onClick={() => setSelectedRating(rating)}
                  >
                    {rating}
                  </button>
                ))}
            </div>

            <button
              className="mb-4 px-4 py-2 bg-cf-blue dark:bg-cf-blue-light text-white rounded hover:bg-opacity-90 transition-colors w-full sm:w-auto"
              onClick={() => setShowDateInputs(!showDateInputs)}
            >
              Select Date Range
            </button>

            {showDateInputs && (
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)} 
                  className="px-4 py-2 border rounded bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light w-full" 
                />
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)} 
                  className="px-4 py-2 border rounded bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light w-full" 
                />
              </div>
            )}

            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-cf-text dark:text-cf-text-light text-sm sm:text-base">Sort by Date:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                className="px-4 py-2 border rounded bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light w-full sm:w-auto"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 dark:bg-gray-600 text-cf-text dark:text-cf-text-light">
                    <th className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">#</th>
                    <th className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Problem</th>
                  </tr>
                </thead>
                <tbody>
                  {problemsToShow.length > 0 ? (
                    problemsToShow.map((problem, index) => (
                      <tr key={problem.id} className="hover:bg-gray-600 dark:hover:bg-gray-500 text-cf-text dark:text-cf-text-light">
                        <td className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">{index + 1}</td>
                        <td className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                          <a 
                            href={`https://codeforces.com/problemset/problem/${problem.id.split('-')[0]}/${problem.id.split('-')[1]}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cf-blue dark:text-cf-blue-light hover:underline"
                          >
                            {problem.name}
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-4 py-2 text-center text-cf-text dark:text-cf-text-light">
                        No problems found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'topics':
        return (
          <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg p-4 sm:p-6 shadow-cf">
            <h2 className="text-xl sm:text-2xl font-bold text-cf-blue dark:text-cf-blue-light mb-4">Solved Problems by Topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {topicProblems &&
                Object.keys(topicProblems)
                  .sort()
                  .map((topic) => (
                    <div key={topic} className="bg-cf-dark dark:bg-cf-dark-light p-4 rounded text-center">
                      <Link
                        to={`topic/${topic}`}
                        className="text-cf-blue dark:text-cf-blue-light font-bold hover:underline"
                      >
                        {topic}
                      </Link>
                    </div>
                  ))}
            </div>
          </div>
        );
      case 'unsolved':
        return (
          <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg p-4 sm:p-6 shadow-cf">
            <h2 className="text-xl sm:text-2xl font-bold text-cf-blue dark:text-cf-blue-light mb-4">Unsolved Problems</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 dark:bg-gray-600 text-cf-text dark:text-cf-text-light">
                    <th className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">#</th>
                    <th className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Problem</th>
                    <th className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Rating</th>
                    <th className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {unsolvedProblems && unsolvedProblems.length > 0 ? (
                    unsolvedProblems.map((problem, index) => (
                      <tr key={problem.id} className="hover:bg-gray-600 dark:hover:bg-gray-500 text-cf-text dark:text-cf-text-light">
                        <td className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">{index + 1}</td>
                        <td className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                          <a 
                            href={`https://codeforces.com/problemset/problem/${problem.id.split('-')[0]}/${problem.id.split('-')[1]}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cf-blue dark:text-cf-blue-light hover:underline"
                          >
                            {problem.name}
                          </a>
                        </td>
                        <td className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                          {problem.rating || 'N/A'}
                        </td>
                        <td className="px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                          {problem.attempts}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-center text-cf-text dark:text-cf-text-light">
                        No unsolved problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 sm:mt-10 px-4 sm:px-0">
      {/* User Info Section */}
      <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg p-4 sm:p-6 shadow-cf text-center">
        <img src={userInfo.titlePhoto} alt="Avatar" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-cf-blue dark:text-cf-blue-light">{userInfo.handle}</h1>
        <p className="text-cf-text dark:text-cf-text-light text-sm sm:text-base">{userInfo.rank} ({userInfo.rating})</p>
        <p className="text-cf-text dark:text-cf-text-light text-sm sm:text-base">Max: {userInfo.maxRank} ({userInfo.maxRating})</p>
      </div>

      {/* Tabs */}
      <div className="mt-6 sm:mt-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'statistics'
                ? 'bg-cf-blue dark:bg-cf-blue-light text-white'
                : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
            } hover:bg-opacity-90 transition-colors`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'rating'
                ? 'bg-cf-blue dark:bg-cf-blue-light text-white'
                : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
            } hover:bg-opacity-90 transition-colors`}
            onClick={() => setActiveTab('rating')}
          >
            Rating Wise
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'topics'
                ? 'bg-cf-blue dark:bg-cf-blue-light text-white'
                : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
            } hover:bg-opacity-90 transition-colors`}
            onClick={() => setActiveTab('topics')}
          >
            Topic Wise
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'unsolved'
                ? 'bg-cf-blue dark:bg-cf-blue-light text-white'
                : 'bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light'
            } hover:bg-opacity-90 transition-colors`}
            onClick={() => setActiveTab('unsolved')}
          >
            Unsolved
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Hero;
