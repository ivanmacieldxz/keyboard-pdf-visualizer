import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PdfViewer from './PdfViewer'

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [isHoveredSecondary, setIsHoveredSecondary] = useState(false)
  const [selectedRecent, setSelectedRecent] = useState(null)
  
  // State for recent folders (persisted in localStorage)
  const [recentFolders, setRecentFolders] = useState([])
  
  // State for the current view and active folder data
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'gallery' | 'pdf'
  const [activeFolder, setActiveFolder] = useState(null)
  const [pdfFiles, setPdfFiles] = useState([])
  const [activePdfPath, setActivePdfPath] = useState(null)
  const [isLoadingGallery, setIsLoadingGallery] = useState(false)

  // Gallery view controls
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name_asc')

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
    setActiveFolder(folderPath)
    saveToRecent(folderPath)
    setSearchQuery('')
    setSortBy('name_asc')
    setPdfFiles([])
    setIsLoadingGallery(true)
    setCurrentView('gallery')
    
    try {
      const files = await window.api.getPdfFiles(folderPath)
      setPdfFiles(files)
    } catch (error) {
      console.error('Failed to open folder:', error)
    } finally {
      setIsLoadingGallery(false)
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

  const handleRecentKeyDown = (e, folder) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedRecent(folder)
      if (selectedRecent?.id === folder.id) {
        openFolder(folder.path) // Open directly on double-enter
      }
    }
  }

  const handlePdfKeyDown = (e, pdf) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActivePdfPath(pdf.path)
      setCurrentView('pdf')
    }
  }

  const openPdf = (pdf) => {
    setActivePdfPath(pdf.path)
    setCurrentView('pdf')
  }

  // Process files for gallery view (filter & sort)
  const processedFiles = useMemo(() => {
    let filtered = pdfFiles.filter(pdf => pdf.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name)
        case 'name_desc': return b.name.localeCompare(a.name)
        case 'size_asc': return a.size - b.size
        case 'size_desc': return b.size - a.size
        case 'created_asc': return a.birthtime - b.birthtime
        case 'created_desc': return b.birthtime - a.birthtime
        case 'modified_asc': return a.mtime - b.mtime
        case 'modified_desc': return b.mtime - a.mtime
        default: return a.name.localeCompare(b.name)
      }
    })
    
    return filtered
  }, [pdfFiles, searchQuery, sortBy])

  if (currentView === 'pdf') {
    const currentIndex = processedFiles.findIndex(p => p.path === activePdfPath)
    
    const handleNextPdf = () => {
      if (currentIndex < processedFiles.length - 1) {
        setActivePdfPath(processedFiles[currentIndex + 1].path)
      }
    }
    
    const handlePrevPdf = () => {
      if (currentIndex > 0) {
        setActivePdfPath(processedFiles[currentIndex - 1].path)
      }
    }
    
    return (
      <PdfViewer 
        pdfPath={activePdfPath}
        onBack={() => setCurrentView('gallery')}
        onNextPdf={handleNextPdf}
        onPrevPdf={handlePrevPdf}
      />
    )
  }

  if (currentView === 'gallery') {
    return (
      <div className="min-h-screen bg-base-black text-white p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Header */}
          <div>
            <button 
              onClick={() => setCurrentView('landing')}
              className="mb-6 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-accent rounded-md px-2 py-1"
            >
              &larr; Back to Home
            </button>
            <h2 className="text-3xl font-bold mb-2 truncate text-teal-accent">{activeFolder}</h2>
            <p className="text-slate-400">{pdfFiles.length} PDF(s) found</p>
          </div>

            {isLoadingGallery && (
              <div className="text-slate-400 font-medium mb-4 animate-pulse">
                Scanning directory...
              </div>
            )}
            {!isLoadingGallery && pdfFiles.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-white/10 items-center justify-between">
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-teal-accent/50 focus:ring-2 focus:ring-teal-accent transition-colors w-full sm:max-w-xs"
              />
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-slate-400 whitespace-nowrap">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-accent/50 focus:ring-2 focus:ring-teal-accent transition-colors w-full sm:w-auto cursor-pointer"
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="modified_desc">Modified (Newest)</option>
                  <option value="modified_asc">Modified (Oldest)</option>
                  <option value="created_desc">Created (Newest)</option>
                  <option value="created_asc">Created (Oldest)</option>
                  <option value="size_desc">Size (Largest)</option>
                  <option value="size_asc">Size (Smallest)</option>
                </select>
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex flex-col gap-3 pb-12">
            {isLoadingGallery ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4 min-w-0 w-full">
                    <div className="w-8 h-10 bg-white/10 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-white/10 rounded w-3/4 sm:w-1/2 mb-2"></div>
                      <div className="flex gap-4">
                        <div className="h-3 bg-white/10 rounded w-20"></div>
                        <div className="h-3 bg-white/10 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-5 bg-white/10 rounded w-16 mt-2 sm:mt-0"></div>
                </div>
              ))
            ) : (
              processedFiles.map((pdf, idx) => (
                <div 
                  key={idx} 
                  tabIndex={0}
                  onClick={() => openPdf(pdf)}
                  onKeyDown={(e) => handlePdfKeyDown(e, pdf)}
                  className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-accent transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-3xl">📄</div>
                    <div className="min-w-0">
                      <div className="font-medium text-lg text-slate-200 truncate" title={pdf.name}>{pdf.name}</div>
                      <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Created: {formatDate(pdf.birthtime)}</span>
                        <span>Modified: {formatDate(pdf.mtime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-teal-accent/80 whitespace-nowrap">
                    {formatBytes(pdf.size)}
                  </div>
                </div>
              ))
            )}
            
            {!isLoadingGallery && pdfFiles.length > 0 && processedFiles.length === 0 && (
              <div className="text-center text-slate-500 py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                No PDFs match your search.
              </div>
            )}
            {!isLoadingGallery && pdfFiles.length === 0 && (
              <div className="text-center text-slate-500 py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                No PDFs found in this directory.
              </div>
            )}
          </div>
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
            className="bg-gradient-to-br from-teal-accent to-blue-accent text-white font-semibold text-lg py-4 px-8 rounded-xl shadow-[0_4px_15px_rgba(45,212,191,0.3)] hover:shadow-[0_8px_25px_rgba(45,212,191,0.5)] focus:outline-none focus:ring-4 focus:ring-teal-accent flex items-center justify-center gap-3 overflow-hidden"
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
                className="text-sm font-semibold px-5 py-2 rounded bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-accent transition-colors disabled:opacity-30 disabled:hover:bg-white/10 disabled:cursor-not-allowed"
                disabled={!selectedRecent}
                onClick={handleOpenRecent}
              >
                Open
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentFolders.length === 0 ? (
                <div className="text-center text-slate-500 py-8 italic border border-dashed border-white/10 rounded-xl bg-white/5">
                  No recent folders yet. Click the button above to get started.
                </div>
              ) : (
                recentFolders.map(folder => (
                  <div 
                    key={folder.id}
                    tabIndex={0}
                    onClick={() => setSelectedRecent(folder)}
                    onKeyDown={(e) => handleRecentKeyDown(e, folder)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border focus:outline-none focus:ring-2 focus:ring-teal-accent ${selectedRecent?.id === folder.id ? 'bg-teal-accent/20 border-teal-accent/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
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
                className="bg-white/5 border border-white/10 text-white font-semibold text-base py-3 px-6 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-accent flex items-center justify-center gap-2 overflow-hidden transition-colors"
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
