import { useState } from 'react'

function App() {
  const [isHovered, setIsHovered] = useState(false)

  const handleSelectFolder = () => {
    // To be implemented in feature/file-system
    console.log('Select folder clicked')
  }

  return (
    <>
      <div className="bg-orb teal"></div>
      <div className="bg-orb blue"></div>
      
      <div className="landing-container">
        <h1 className="hero-title">
          Keyboard <span className="text-gradient">PDF Visualizer</span>
        </h1>
        
        <p className="hero-subtitle">
          A seamlessly interactive, high-performance gallery for your PDF files.
          Navigate at the speed of thought.
        </p>

        <button 
          className="btn-primary" 
          onClick={handleSelectFolder}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered ? 'Select a Folder ->' : 'Select Folder'}
        </button>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">⌨️</div>
            <h3 className="feature-title">Keyboard Driven</h3>
            <p className="feature-desc">Flick through pages and documents without touching your mouse.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-desc">Optimized rendering ensures smooth transitions and instant loading.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Quick Search</h3>
            <p className="feature-desc">Find exactly what you need with robust, integrated text search.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
