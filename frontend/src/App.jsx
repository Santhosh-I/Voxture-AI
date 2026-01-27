import { useState } from 'react';
import Login from './pages/Login';
import Gesture from './pages/gesture';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {currentPage === 'login' && <Login onNavigate={navigateToPage} />}
      {currentPage === 'gesture' && <Gesture onNavigate={navigateToPage} />}
    </div>
  );
}

export default App;
