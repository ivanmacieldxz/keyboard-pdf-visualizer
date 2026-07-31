import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [isHoveredSecondary, setIsHoveredSecondary] = useState(false)
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
      {/* Background Orbs */}
      <div className="bg-orb w-[400px] h-[400px] bg-teal-accent -top-24 -left-24 fixed"></div>
      <div className="bg-orb w-[500px] h-[500px] bg-blue-accent -bottom-36 -right-36 [animation-delay:-5s] fixed"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Hero Section - Full Screen */}
        <div className="h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 relative">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-center tracking-tight">
            Keyboard <span className="text-gradient">PDF Visualizer</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-400 mb-12 text-center font-light max-w-2xl">
            A seamlessly interactive, high-performance gallery for your PDF files.
            Navigate at the speed of thought.
          </p>

          {/* Main CTA Button */}
          <motion.button 
            className="bg-gradient-to-br from-teal-accent to-blue-accent text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-[0_4px_15px_rgba(45,212,191,0.3)] hover:shadow-[0_8px_25px_rgba(45,212,191,0.5)] flex items-center justify-center gap-3 overflow-hidden"
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

          {/* Scroll Visual Cue */}
          <motion.div 
            className="absolute bottom-12 text-slate-400 flex flex-col items-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <span className="text-sm font-medium mb-2 opacity-60">Scroll to explore</span>
            <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>

        {/* Content Section (Recent Folders only) */}
        <div className="w-full max-w-3xl px-6 pb-24 flex flex-col gap-12">
          
          {/* Recent Folders Section */}
          <div className="flex flex-col mt-4">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h2 className="text-2xl font-bold text-white">Recent Folders</h2>
              <button 
                className="text-sm font-semibold px-5 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:hover:bg-white/10 disabled:cursor-not-allowed"
                disabled={!selectedRecent}
                onClick={handleOpenRecent}
              >
                Open
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentFolders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => setSelectedRecent(folder)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors border ${selectedRecent?.id === folder.id ? 'bg-teal-accent/20 border-teal-accent/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="font-medium text-lg text-slate-200">{folder.name}</div>
                  <div className="text-sm text-slate-500 truncate mt-1">{folder.path}</div>
                </div>
              ))}
            </div>

            {/* Select Arbitrary Folder Button (Secondary) */}
            <div className="mt-8 flex justify-center border-t border-white/5 pt-8">
              <motion.button 
                className="bg-white/5 border border-white/10 text-white font-semibold text-base py-3 px-6 rounded-lg hover:bg-white/10 flex items-center justify-center gap-2 overflow-hidden transition-colors"
                onClick={handleSelectFolder}
                onHoverStart={() => setIsHoveredSecondary(true)}
                onHoverEnd={() => setIsHoveredSecondary(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Browse other folders</span>
                <AnimatePresence>
                  {isHoveredSecondary && (
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
            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default App
