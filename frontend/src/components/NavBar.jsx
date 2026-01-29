import "../styles/NavBar.css";

function NavBar({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">🤖</span>
        Voxture-AI
      </div>
      <nav className="nav">
        <button 
          className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button 
          className={`nav-btn ${currentPage === 'gesture' ? 'active' : ''}`}
          onClick={() => onNavigate('gesture')}
        >
          Recognition
        </button>
        <button className="nav-btn">Features</button>
        <button className="nav-btn">About</button>
        <button className="nav-btn">Contact</button>
      </nav>
      <div className="header-actions">
        <button 
          className="btn-primary"
          onClick={() => onNavigate('login')}
        >
          Log Out
        </button>
      </div>
    </header>
  );
}

export default NavBar;