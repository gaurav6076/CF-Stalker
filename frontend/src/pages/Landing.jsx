import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';


function Landing() {
  const [handle, setHandle] = useState('');
  const navigate = useNavigate();
  const [visitCount, setVisitCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      navigate(`/hero/${handle}`);
    } else {
      alert('Invalid Codeforces handle!');
    }
  };

  useEffect(() => {
    const updateVisitCount = async () => {
      try {
        // First increment the counter
        await fetch(`${import.meta.env.VITE_API_URL}/api/visits/increment`, {
          method: 'POST'
        });
        
        // Then fetch the updated count
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visits`);
        const data = await response.json();
        setVisitCount(data.count);
      } catch (error) {
        console.error('Error updating visit count:', error);
      }
    };

    updateVisitCount();
  }, []);

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

      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-cf-gray dark:bg-cf-gray-light rounded-lg shadow-cf p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-cf-blue dark:text-cf-blue-light mb-2">CF Stalker</h1>
              <p className="text-cf-text dark:text-cf-text-light text-sm sm:text-base">Your Stalking Companion</p>
            </div>

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-cf-text dark:text-cf-text-light mb-2"></label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-4 py-2 bg-cf-dark dark:bg-cf-dark-light border border-cf-gray dark:border-cf-gray-light rounded text-cf-text dark:text-cf-text-light focus:outline-none focus:border-cf-blue dark:focus:border-cf-blue-light text-sm sm:text-base"
                  placeholder="Enter Codeforces handle"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-cf-blue dark:bg-cf-blue-light text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors text-sm sm:text-base">
                Enter
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/contests" 
                className="w-full inline-block bg-cf-blue dark:bg-cf-blue-light text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors text-sm sm:text-base"
              >
                Contest Analyzer
              </Link>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-cf-text dark:text-cf-text-light">
            <p>© 2025 CF Stalker. All rights reserved.</p>
            <p className="mt-2">Total Visits: <span className="text-cf-blue dark:text-cf-blue-light font-semibold">{visitCount.toLocaleString()}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;