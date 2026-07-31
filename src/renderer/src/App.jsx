import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [isHoveredSecondary, setIsHoveredSecondary] = useState(false)
  const [selectedRecent, setSelectedRecent] = useState(null)

  // State for recent folders (persisted in localStorage)
  const [recentFolders, setRecentFolders] = useState([])

  // State for the current view and active folder data
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'gallery'
  const [activeFolder, setActiveFolder] = useState(null)
  const [pdfFiles, setPdfFiles] = useState([])

  // Load recent folders on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentFolders')
    if (stored) {
      setRecentFolders(JSON.parse(stored))
    }
  }, [])

  const saveToRecent = (folderPath) => {
    // Extract folder name from path (rudimentary split)
    const name = folderPath.split(/[/\\]/).pop() || folderPath
    const newFolder = { id: Date.now(), name, path: folderPath }

    setRecentFolders(prev => {
      // Remove if it already exists, then add to top
      const filtered = prev.filter(f => f.path !== folderPath)
      const updated = [newFolder, ...filtered].slice(0, 5) // Keep max 5
      localStorage.setItem('recentFolders', JSON.stringify(updated))
      return updated
    })
  }

  const openFolder = async (folderPath) => {
    try {
      const files = await window.api.getPdfFiles(folderPath)
      setPdfFiles(files)
      setActiveFolder(folderPath)
      saveToRecent(folderPath)
      setCurrentView('gallery')
    } catch (error) {
      console.error('Failed to open folder:', error)
    }
  }

  const handleSelectFolder = async () => {
    try {
      const folderPath = await window.api.openDirectory()
      if (folderPath) {
        await openFolder(folderPath)
      }
    } catch (error) {
      console.error('Failed to select directory:', error)
    }
  }

  const handleOpenRecent = () => {
    if (selectedRecent) {
      openFolder(selectedRecent.path)
    }
  }

  if (currentView === 'gallery') {
    return (
      <div className="min-h-screen bg-base-black text-white p-8">
        <button
          onClick={() => setCurrentView('landing')}
          className="mb-6 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          &larr; Back to Home
        </button>
        <h2 className="text-2xl font-bold mb-2 truncate text-teal-accent">{activeFolder}</h2>
        <p className="text-slate-400 mb-8">{pdfFiles.length} PDF(s) found</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {pdfFiles.map((pdf, idx) => (
            <div key={idx} className="glass-panel p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-colors aspect-square">
              <div className="text-4xl mb-3">📄</div>
              <div className="text-sm font-medium truncate w-full px-2" title={pdf.name}>{pdf.name}</div>
            </div>
          ))}
          {pdfFiles.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-12">
              No PDFs found in this directory.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Background Orbs */}
      <div className="bg-orb w-[400px] h-[400px] bg-teal-accent -top-24 -left-24 fixed pointer-events-none"></div>
      <div className="bg-orb w-[500px] h-[500px] bg-blue-accent -bottom-36 -right-36 [animation-delay:-5s] fixed pointer-events-none"></div>

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
            className="absolute bottom-12 text-slate-400 flex flex-col items-center pointer-events-none"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <span className="text-sm font-medium mb-2 opacity-60">Scroll to recents</span>
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
              {recentFolders.length === 0 ? (
                <div className="text-center text-slate-500 py-8 italic border border-dashed border-white/10 rounded-xl bg-white/5">
                  No recent folders yet.
                </div>
              ) : (
                recentFolders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedRecent(folder)}
                    className={`p-4 rounded-xl cursor-pointer transition-colors border ${selectedRecent?.id === folder.id ? 'bg-teal-accent/20 border-teal-accent/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <div className="font-medium text-lg text-slate-200">{folder.name}</div>
                    <div className="text-sm text-slate-500 truncate mt-1">{folder.path}</div>
                  </div>
                ))
              )}
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
