// HeroLayout.jsx
import React, { useEffect, useState, createContext } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export const HeroContext = createContext();

function HeroLayout() {
  const { handle } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState({});
  const [topicProblems, setTopicProblems] = useState({});
  const [unsolvedProblems, setUnsolvedProblems] = useState([]);

  // Persistent filter state
  const [selectedRating, setSelectedRating] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDateInputs, setShowDateInputs] = useState(false);

  useEffect(() => {
    // Fetch user info
    fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'OK') {
          setUserInfo(data.result[0]);
        }
      });

    // Fetch submissions and build mappings for ratings and topics.
    fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'OK') {
          const solvedByRating = {};
          const solvedByTopic = {};
          const unsolvedProblems = {};
          const problemLastSubmission = {}; // Track last submission time for each problem
          const solvedProblemIds = new Set(); // Track all solved problem IDs

          // First pass: identify all solved problems
          data.result.forEach((submission) => {
            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
            if (submission.verdict === "OK") {
              solvedProblemIds.add(problemId);
            }
          });

          // Second pass: process submissions
          data.result.forEach((submission) => {
            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
            const submissionTime = submission.creationTimeSeconds * 1000;
            const problemData = {
              id: problemId,
              name: submission.problem.name,
              time: submissionTime,
              rating: submission.problem.rating,
              tags: submission.problem.tags || []
            };

            // Update last submission time for this problem
            if (!problemLastSubmission[problemId] || submissionTime > problemLastSubmission[problemId]) {
              problemLastSubmission[problemId] = submissionTime;
            }

            if (submission.verdict === "OK" && submission.problem.rating) {
              const rating = submission.problem.rating.toString();
              
              // Build rating mapping - only add if this is the most recent submission
              if (submissionTime === problemLastSubmission[problemId]) {
                if (!solvedByRating[rating]) {
                  solvedByRating[rating] = [];
                }
                solvedByRating[rating].push(problemData);
              }

              // Build topic mapping - only add if this is the most recent submission
              if (submissionTime === problemLastSubmission[problemId]) {
                problemData.tags.forEach((tag) => {
                  if (!solvedByTopic[tag]) {
                    solvedByTopic[tag] = [];
                  }
                  solvedByTopic[tag].push(problemData);
                });
              }
            } else if (submission.verdict !== "OK" && !solvedProblemIds.has(problemId)) {
              // Only track unsolved problems that have never been solved
              if (!unsolvedProblems[problemId]) {
                unsolvedProblems[problemId] = {
                  ...problemData,
                  attempts: 1
                };
              } else {
                unsolvedProblems[problemId].attempts++;
              }
            }
          });

          // Remove duplicates from solved problems
          Object.keys(solvedByRating).forEach(rating => {
            const uniqueProblems = {};
            solvedByRating[rating].forEach(problem => {
              uniqueProblems[problem.id] = problem;
            });
            solvedByRating[rating] = Object.values(uniqueProblems);
          });

          Object.keys(solvedByTopic).forEach(topic => {
            const uniqueProblems = {};
            solvedByTopic[topic].forEach(problem => {
              uniqueProblems[problem.id] = problem;
            });
            solvedByTopic[topic] = Object.values(uniqueProblems);
          });

          setSolvedProblems(solvedByRating);
          setTopicProblems(solvedByTopic);
          setUnsolvedProblems(Object.values(unsolvedProblems));
          
          // Set default rating if not already set
          const sortedRatings = Object.keys(solvedByRating).sort((a, b) => a - b);
          if (!selectedRating && sortedRatings.length > 0) {
            setSelectedRating(sortedRatings[0]);
          }
        }
      });
  }, [handle, selectedRating]);

  return (
    <HeroContext.Provider
      value={{
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
        handle,
        showDateInputs,
        setShowDateInputs
      }}
    >
      <div className="min-h-screen bg-cf-dark dark:bg-cf-dark-light p-6">
        <nav className="bg-cf-dark dark:bg-cf-dark-light border-b border-cf-gray dark:border-cf-gray-light p-4 flex justify-between items-center">
          <Link to="/" className="text-cf-blue dark:text-cf-blue-light font-bold text-xl hover:text-cf-link dark:hover:text-cf-link-light">
            CF Stalker
          </Link>
          <ThemeToggle />
        </nav>
        <Outlet />
      </div>
    </HeroContext.Provider>
  );
}

export default HeroLayout;
