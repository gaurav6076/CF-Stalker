import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import HeroLayout from './pages/HeroLayout.jsx';
import Hero from './pages/Hero.jsx';
import Topic from './pages/Topic.jsx';
import ContestAnalyzer from './pages/ContestAnalyzer.jsx';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-cf-dark dark:bg-cf-dark-light">
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/hero/:handle" element={<HeroLayout />}>
                <Route index element={<Hero />} />
                <Route path="topic/:topic" element={<Topic />} />
              </Route>
              <Route path="/contests" element={<ContestAnalyzer />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
