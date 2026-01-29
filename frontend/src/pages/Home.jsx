import "../styles/Home.css";
import NavBar from "../components/NavBar";

function Home({ onNavigate }) {
  return (
    <div className="home-container">
      {/* Animated background */}
      <div className="bg-dots"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      {/* Header */}
      <NavBar currentPage="home" onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            <span className="badge-icon">✨</span> AI-Powered Technology
          </div>
          
          <h1 className="hero-title">
            Breaking Barriers with
            <br />
            <span className="gradient-text">Sign Language AI</span>
          </h1>
          
          <p className="hero-subtitle">
            Experience real-time sign language recognition powered by cutting-edge 
            artificial intelligence. Making communication accessible for everyone.
          </p>

          <div className="hero-buttons">
            <button 
              className="cta-button primary"
              onClick={() => onNavigate('gesture')}
            >
              <span className="cta-glow"></span>
              Start Recognition
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="cta-button secondary">
              <span className="play-icon">▶</span>
              Watch Demo
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">99%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">50+</span>
              <span className="stat-label">Gestures</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">Real-time</span>
              <span className="stat-label">Detection</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="hand-icon">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7"/>
                    <stop offset="100%" stopColor="#6366f1"/>
                  </linearGradient>
                </defs>
                <path d="M50 15 L50 35 M35 20 L35 40 M65 20 L65 40 M25 30 L25 55 M75 30 L75 50 M20 55 Q15 70 25 80 L75 80 Q85 70 80 50 L80 45 Q80 40 75 40 L75 50 M25 55 L25 60 Q20 65 25 70" 
                      stroke="url(#handGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="ai-badge">
              <span className="pulse"></span>
              AI Active
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose Voxture-AI?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>High Accuracy</h3>
            <p>Advanced machine learning models trained on thousands of gestures for precise recognition.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Processing</h3>
            <p>Instant gesture detection with minimal latency for seamless communication.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>All processing happens locally. Your data never leaves your device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Easy Integration</h3>
            <p>Simple API for developers to integrate sign language recognition into any application.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users breaking communication barriers with AI.</p>
          <button 
            className="cta-button primary large"
            onClick={() => onNavigate('gesture')}
          >
            <span className="cta-glow"></span>
            Try It Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🤖</span>
            <span>Voxture-AI</span>
          </div>
          <p className="footer-text">© 2026 Voxture-AI. Making communication accessible.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
