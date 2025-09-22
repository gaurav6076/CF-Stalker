// Topic.jsx
import React, { useContext, useState, useEffect } from 'react';
import { HeroContext } from './HeroLayout';
import { useParams, Link } from 'react-router-dom';

function Topic() {
  const { topic } = useParams();
  const {
    topicProblems,
    handle
  } = useContext(HeroContext);
  const [problems, setProblems] = useState([]);
  const [activeSort, setActiveSort] = useState("date"); // "date" or "rating"
  const [dateSortOrder, setDateSortOrder] = useState("desc");
  const [ratingSortOrder, setRatingSortOrder] = useState("desc");

  useEffect(() => {
    if (topicProblems[topic]) {
      setProblems(topicProblems[topic]);
    }
  }, [topic, topicProblems]);

  const sortProblems = (problems) => {
    return [...problems].sort((a, b) => {
      if (activeSort === "date") {
        return dateSortOrder === "asc" ? a.time - b.time : b.time - a.time;
      } else {
        return ratingSortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      }
    });
  };

  const sortedProblems = sortProblems(problems);

  return (
    <div className="max-w-3xl mx-auto mt-4 sm:mt-8 px-4 sm:px-0">
      <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg p-4 sm:p-6 shadow-cf">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-cf-blue dark:text-cf-blue-light">
            Problems for Topic: {topic}
          </h2>
          <Link 
            to={`/hero/${handle}`} 
            className="text-cf-blue dark:text-cf-blue-light hover:underline text-sm sm:text-base"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-cf-text dark:text-cf-text-light text-sm sm:text-base">Sort By:</label>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="px-4 py-2 border rounded bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light w-full sm:w-auto"
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          {activeSort === "date" ? (
            <select
              value={dateSortOrder}
              onChange={(e) => setDateSortOrder(e.target.value)}
              className="px-4 py-2 border rounded bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light w-full sm:w-auto"
            >
              <option value="asc">Date Ascending</option>
              <option value="desc">Date Descending</option>
            </select>
          ) : (
            <select
              value={ratingSortOrder}
              onChange={(e) => setRatingSortOrder(e.target.value)}
              className="px-4 py-2 border rounded bg-cf-dark dark:bg-cf-dark-light text-cf-text dark:text-cf-text-light w-full sm:w-auto"
            >
              <option value="asc">Rating Ascending</option>
              <option value="desc">Rating Descending</option>
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-700 dark:bg-gray-600 text-cf-text dark:text-cf-text-light">
                <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">#</th>
                <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Problem</th>
                <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Rating</th>
                <th className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">Solved Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedProblems.length > 0 ? (
                sortedProblems.map((problem, index) => (
                  <tr key={problem.id} className="hover:bg-gray-600 dark:hover:bg-gray-500 text-cf-text dark:text-cf-text-light">
                    <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">{index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                      <a
                        href={`https://codeforces.com/problemset/problem/${problem.id.split('-')[0]}/${problem.id.split('-')[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cf-blue dark:text-cf-blue-light hover:underline break-words"
                      >
                        {problem.name}
                      </a>
                    </td>
                    <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light">
                      {problem.rating || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 py-2 border border-cf-gray dark:border-cf-gray-light whitespace-nowrap">
                      {new Date(problem.time).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-2 sm:px-4 py-2 text-center text-cf-text dark:text-cf-text-light">
                    No problems found for this topic.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Topic;
