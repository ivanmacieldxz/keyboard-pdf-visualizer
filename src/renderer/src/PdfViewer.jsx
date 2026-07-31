import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { motion, AnimatePresence } from 'framer-motion'
import 'pdfjs-dist/web/pdf_viewer.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export default function PdfViewer({ pdfPath, onBack, onNextPdf, onPrevPdf }) {
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [scale, setScale] = useState(1.5)
  const [isSearching, setIsSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  const renderTaskRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const textLayerRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setErrorMsg('')
    const loadPdf = async () => {
      try {
        const buffer = await window.api.readFile(pdfPath)
        const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
        const loadingTask = pdfjsLib.getDocument({ data })
        const pdf = await loadingTask.promise
        if (!active) return
        setPdfDoc(pdf)
        setNumPages(pdf.numPages)
        setPageNum(1)
        setLoading(false)
      } catch (err) {
        console.error('Error loading PDF:', err)
        if (active) {
          setErrorMsg(err.toString())
          setLoading(false)
        }
      }
    }
    loadPdf()
    return () => { active = false }
  }, [pdfPath])

  const renderPage = useCallback(async (num, pdf) => {
    if (!pdf || !canvasRef.current) return
    
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
    }

    try {
      const page = await pdf.getPage(num)
      
      // Calculate scale to fit width or height
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      const renderTask = page.render(renderContext)
      renderTaskRef.current = renderTask
      await renderTask.promise

      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = ''
        const textContent = await page.getTextContent()
        
        pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport: viewport,
          textDivs: []
        })
      }
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Render error:', err)
        setErrorMsg(err.toString())
      }
    }
  }, [scale])

  useEffect(() => {
    if (pdfDoc && !loading) {
      renderPage(pageNum, pdfDoc)
      // Auto-focus container so native arrow-key panning works
      if (containerRef.current) {
        containerRef.current.focus()
      }
    }
  }, [pageNum, pdfDoc, loading, renderPage])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setIsSearching(true)
        setTimeout(() => searchInputRef.current?.focus(), 10)
        return
      }

      // Zoom with Ctrl + / Ctrl -
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        setScale(s => Math.min(s + 0.25, 5.0))
        return
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault()
        setScale(s => Math.max(s - 0.25, 0.5))
        return
      }
      
      // Previous/Next file with Ctrl+Arrow Left/Right
      if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault()
        onNextPdf()
      } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault()
        onPrevPdf()
      }
      // Previous/Next page with Ctrl+Arrow Up/Down
      else if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault()
        setPageNum(prev => Math.min(prev + 1, numPages))
        setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = 0 }, 10)
      } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault()
        setPageNum(prev => Math.max(prev - 1, 1))
        setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = 0 }, 10)
      }
      // Next page with Space
      else if (e.key === ' ') {
        e.preventDefault()
        setPageNum(prev => Math.min(prev + 1, numPages))
      } 
      // Arrow keys for pan (scroll) / Page boundaries
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current
          
          if (e.key === 'ArrowDown' && Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
            e.preventDefault()
            if (pageNum < numPages) {
              setPageNum(prev => prev + 1)
              // Reset scroll to top
              setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = 0 }, 10)
            }
          } else if (e.key === 'ArrowUp' && scrollTop <= 0) {
            e.preventDefault()
            if (pageNum > 1) {
              setPageNum(prev => prev - 1)
              // Reset scroll to bottom
              setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight }, 10)
            }
          }
          // Note: Native browser scrolling happens automatically if we don't preventDefault.
        }
      } 
      // Escape to back
      else if (e.key === 'Escape' && !isSearching) {
        handleBack()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageNum, numPages, onNextPdf, onPrevPdf, onBack, isSearching])

  const handleBack = () => {
    window.api.stopFindInPage('clearSelection')
    onBack()
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900 overflow-hidden relative">
      {/* UI Overlay */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 z-50"
        >
          <button 
            onClick={handleBack}
            className="text-sm font-semibold bg-black/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-accent"
          >
            &larr; Back to Gallery (Esc)
          </button>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg font-medium text-sm flex gap-4 items-center">
        <span>{pdfPath.split(/[/\\]/).pop()}</span>
        <span className="text-teal-accent">{pageNum} / {numPages}</span>
        <span className="text-slate-400 bg-black/50 px-2 py-1 rounded">{(scale * 100).toFixed(0)}%</span>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 z-50 bg-slate-800 border border-white/10 shadow-2xl rounded-lg p-2 flex gap-2 items-center"
          >
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                if (e.target.value) {
                  window.api.findInPage(e.target.value)
                } else {
                  window.api.stopFindInPage('clearSelection')
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.api.findInPage(searchText, { findNext: true, forward: !e.shiftKey })
                }
                if (e.key === 'Escape') {
                  setIsSearching(false)
                  setSearchText('')
                  window.api.stopFindInPage('clearSelection')
                  containerRef.current?.focus()
                }
              }}
              placeholder="Find in page... (Enter)"
              className="bg-black/20 text-white px-3 py-1.5 rounded outline-none focus:ring-2 focus:ring-teal-accent text-sm w-48"
            />
            <button 
              onClick={() => window.api.findInPage(searchText, { findNext: true, forward: false })}
              className="text-slate-400 hover:text-white px-2"
              title="Previous (Shift+Enter)"
            >↑</button>
            <button 
              onClick={() => window.api.findInPage(searchText, { findNext: true, forward: true })}
              className="text-slate-400 hover:text-white px-2"
              title="Next (Enter)"
            >↓</button>
            <button 
              onClick={() => {
                setIsSearching(false)
                setSearchText('')
                window.api.stopFindInPage('clearSelection')
                containerRef.current?.focus()
              }}
              className="text-slate-400 hover:text-red-400 px-2 ml-1 border-l border-white/10"
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* PDF Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-8 outline-none text-center"
        tabIndex={0}
      >
        {errorMsg && (
          <div className="absolute bottom-10 left-10 text-red-500 bg-black/80 px-6 py-4 rounded-lg z-50 font-mono shadow-2xl max-w-2xl break-words">
            {errorMsg}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">
            Loading PDF...
          </div>
        ) : (
          <div className="relative inline-block max-w-none shadow-2xl rounded bg-white" style={{ flexShrink: 0 }}>
            <motion.canvas 
              ref={canvasRef} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="block" 
            />
            <div 
              ref={textLayerRef} 
              className="textLayer absolute top-0 left-0 w-full h-full"
              style={{ '--scale-factor': scale }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
