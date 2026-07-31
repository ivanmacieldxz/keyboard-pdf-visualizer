import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedRecent, setSelectedRecent] = useState(null)

  // Mock data for recent folders
  const recentFolders = [
    { id: 1, name: 'Project Alpha', path: '/Users/ivan/Documents/Alpha' },
    { id: 2, name: 'Invoices 2026', path: '/Users/ivan/Downloads/Invoices' },
  ]

  const handleSelectFolder = () => {
    // To be implemented in feature/file-system
    console.log('Select folder clicked')
  }

  const handleOpenRecent = () => {
    if (selectedRecent) {
      console.log('Opening recent folder:', selectedRecent.path)
    }
  }

  return (
    <>
      <div className="bg-orb w-[400px] h-[400px] bg-teal-accent -top-24 -left-24"></div>
      <div className="bg-orb w-[500px] h-[500px] bg-blue-accent -bottom-36 -right-36 [animation-delay:-5s]"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-center tracking-tight">
          Keyboard <span className="text-gradient">PDF Visualizer</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 mb-12 text-center font-light max-w-2xl">
          A seamlessly interactive, high-performance gallery for your PDF files.
          Navigate at the speed of thought.
        </p>

        {/* Main CTA Button */}
        <motion.button 
          className="bg-gradient-to-br from-teal-accent to-blue-accent text-white font-semibold py-3 px-6 rounded-lg shadow-[0_4px_15px_rgba(45,212,191,0.3)] hover:shadow-[0_8px_25px_rgba(45,212,191,0.5)] flex items-center justify-center gap-2 overflow-hidden"
          onClick={handleSelectFolder}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Select Folder</span>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="whitespace-nowrap"
              >
                -&gt;
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Features Vertical List */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white mb-2">Features</h2>
            
            <div className="glass-panel p-5 transition-transform hover:-translate-y-1 hover:bg-slate-800/60">
              <div className="text-3xl mb-2 text-gradient inline-block">⌨️</div>
              <h3 className="text-lg font-semibold mb-1">Keyboard Driven</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Flick through pages and documents without touching your mouse.</p>
            </div>
            
            <div className="glass-panel p-5 transition-transform hover:-translate-y-1 hover:bg-slate-800/60">
              <div className="text-3xl mb-2 text-gradient inline-block">⚡</div>
              <h3 className="text-lg font-semibold mb-1">Lightning Fast</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Optimized rendering ensures smooth transitions and instant loading.</p>
            </div>

            <div className="glass-panel p-5 transition-transform hover:-translate-y-1 hover:bg-slate-800/60">
              <div className="text-3xl mb-2 text-gradient inline-block">🔍</div>
              <h3 className="text-lg font-semibold mb-1">Quick Search</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Find exactly what you need with robust, integrated text search.</p>
            </div>
          </div>

          {/* Recent Folders Section */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
              <h2 className="text-2xl font-bold text-white">Recent Folders</h2>
              <button 
                className="text-sm font-semibold px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:hover:bg-white/10 disabled:cursor-not-allowed"
                disabled={!selectedRecent}
                onClick={handleOpenRecent}
              >
                Open
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {recentFolders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => setSelectedRecent(folder)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedRecent?.id === folder.id ? 'bg-teal-accent/20 border-teal-accent/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-medium text-slate-200">{folder.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-1">{folder.path}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
