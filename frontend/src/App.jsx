import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Gesture from './pages/gesture';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {currentPage === 'home' && <Home onNavigate={navigateToPage} />}
      {currentPage === 'login' && <Login onNavigate={navigateToPage} />}
      {currentPage === 'gesture' && <Gesture onNavigate={navigateToPage} />}
    </div>
  );
}

export default App;
