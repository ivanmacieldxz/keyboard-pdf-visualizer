import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { motion, AnimatePresence } from 'framer-motion'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PdfViewer({ pdfPath, onBack, onNextPdf, onPrevPdf }) {
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
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
        if (active) setLoading(false)
      }
    }
    loadPdf()
    return () => { active = false }
  }, [pdfPath])

  const renderPage = useCallback(async (num, pdf) => {
    if (!pdf || !canvasRef.current) return
    const page = await pdf.getPage(num)
    
    // Calculate scale to fit width or height (simple 1.5 default for now, we can optimize later)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    
    // We don't await because we want to let React finish rendering, but we can await it
    await page.render(renderContext).promise
  }, [])

  useEffect(() => {
    if (pdfDoc && !loading) {
      renderPage(pageNum, pdfDoc)
    }
  }, [pageNum, pdfDoc, loading, renderPage])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Previous/Next file with Ctrl+Arrow
      if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault()
        onNextPdf()
      } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault()
        onPrevPdf()
      } 
      // Next page with Space
      else if (e.key === ' ') {
        e.preventDefault()
        setPageNum(prev => Math.min(prev + 1, numPages))
      } 
      // Arrow keys for pan (scroll)
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Native scrolling in the container will happen automatically if it's focused,
        // but let's ensure the container has focus or scroll it manually
        if (containerRef.current) {
          const step = 50
          if (e.key === 'ArrowDown') containerRef.current.scrollTop += step
          if (e.key === 'ArrowUp') containerRef.current.scrollTop -= step
          if (e.key === 'ArrowLeft') containerRef.current.scrollLeft -= step
          if (e.key === 'ArrowRight') containerRef.current.scrollLeft += step
        }
      } 
      // Escape to back
      else if (e.key === 'Escape') {
        onBack()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [numPages, onNextPdf, onPrevPdf, onBack])

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
            onClick={onBack}
            className="text-sm font-semibold bg-black/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-accent"
          >
            &larr; Back to Gallery (Esc)
          </button>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg font-medium text-sm flex gap-4">
        <span>{pdfPath.split(/[/\\]/).pop()}</span>
        <span className="text-teal-accent">{pageNum} / {numPages}</span>
      </div>
      
      {/* PDF Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center p-8 outline-none"
        tabIndex={0}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">
            Loading PDF...
          </div>
        ) : (
          <motion.canvas 
            ref={canvasRef} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="shadow-2xl rounded bg-white" 
          />
        )}
      </div>
    </div>
  )
}
