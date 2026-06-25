import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, ArrowRight, X, Lock, Crown, ZoomIn, ZoomOut } from 'lucide-react';
import { MagazineIssue, AppView } from '../types';
import { useSubscription } from '../context/SubscriptionContext';

// Set up PDF.js worker - use CDN to ensure version compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFReaderProps {
  issue: MagazineIssue;
  onViewChange: (view: AppView) => void;
}

export default function PDFReader({ issue, onViewChange }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const { isSubscribed, canAccessPage, openPremiumModal } = useSubscription();

  // Debug: Log the PDF URL
  useEffect(() => {
    console.log('PDF URL:', issue.pdfUrl);
  }, [issue.pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
    console.log('PDF loaded successfully. Total pages:', numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError(`Failed to load PDF: ${error.message}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    
    if (nextPage <= numPages) {
      // Check if user can access the next page
      if (!canAccessPage(nextPage)) {
        // Show premium modal when trying to access page 6 or beyond
        openPremiumModal();
      } else {
        setCurrentPage(nextPage);
      }
    }
  };

  const handlePageClick = (pageNum: number) => {
    if (!canAccessPage(pageNum)) {
      openPremiumModal();
    } else {
      setCurrentPage(pageNum);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  // Get PDF URL - handle both /src/data and direct paths
  const pdfUrl = issue.pdfUrl || '';

  return (
    <div id="pdf-reader" className="fixed inset-0 z-[100] bg-[#0e0e0e] text-[#e5e2e1] flex flex-col select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-[#131313]">
        <button
          onClick={() => onViewChange('public')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white font-mono text-xs uppercase transition-colors"
        >
          <X className="w-4 h-4" /> Exit Reader
        </button>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-zinc-500">
            Page {currentPage} of {numPages}
          </span>
          
          {isSubscribed && (
            <span className="font-mono text-[10px] text-[#c3f400] border border-[#c3f400] px-3 py-1 font-bold flex items-center gap-2">
              <Crown className="w-3 h-3" />
              PREMIUM
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Page Directory */}
        <div className="w-64 border-r border-zinc-900 bg-[#131313] p-4 overflow-y-auto">
          <h3 className="font-mono text-xs text-[#c3f400] uppercase font-bold mb-4">
            Pages
          </h3>
          <div className="space-y-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
              const isLocked = !canAccessPage(pageNum);
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  disabled={isLocked}
                  className={`w-full flex items-center justify-between text-left py-2 px-3 transition-colors ${
                    isActive
                      ? 'bg-[#c3f400] text-black font-bold'
                      : isLocked
                      ? 'text-zinc-700 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span className="font-mono text-xs">Page {pageNum}</span>
                  {isLocked && <Lock className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* PDF Display Area */}
        <div className="flex-1 overflow-auto flex flex-col items-center bg-[#0e0e0e] p-8">
          {!canAccessPage(currentPage) ? (
            // Premium Gate Display
            <div className="flex flex-col items-center justify-center text-center space-y-8 py-12 max-w-2xl">
              <div className="w-24 h-24 bg-[#c3f400]/20 border-4 border-[#c3f400] flex items-center justify-center animate-pulse">
                <Lock className="w-12 h-12 text-[#c3f400]" />
              </div>

              <div className="space-y-4">
                <span className="font-mono text-xs text-[#c3f400] tracking-[0.3em] uppercase font-black block">
                  Premium Content Ahead
                </span>
                <h3 className="font-serif font-black text-5xl md:text-7xl text-white leading-[0.95] uppercase italic tracking-tighter">
                  Unlock Full Access
                </h3>
                <p className="font-sans text-lg text-zinc-300 leading-relaxed">
                  Subscribe to Vanguard Premium to continue reading. Get unlimited access to all magazines, full PDF downloads, and monthly editions.
                </p>
              </div>

              <button
                onClick={openPremiumModal}
                className="bg-[#c3f400] text-black font-mono text-sm font-black uppercase py-4 px-8 hover:bg-white transition-colors flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Unlock Premium Access
              </button>

              <div className="pt-8 border-t border-zinc-900">
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider leading-relaxed">
                  Subscribe to access {numPages - 5} additional pages
                </p>
              </div>
            </div>
          ) : (
            // PDF Page Display
            <div className="bg-white">
              {pdfError && (
                <div className="flex flex-col items-center justify-center h-[600px] w-[450px] bg-zinc-900 border border-red-800 p-6 text-center">
                  <p className="font-mono text-xs text-red-500 mb-4">Failed to load PDF</p>
                  <p className="font-mono text-[10px] text-zinc-400">{pdfError}</p>
                  <p className="font-mono text-[10px] text-zinc-500 mt-4">PDF Path: {pdfUrl}</p>
                </div>
              )}
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-[600px] w-[450px] bg-zinc-900 border border-zinc-800">
                    <p className="font-mono text-xs text-zinc-500">Loading PDF...</p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center h-[600px] w-[450px] bg-zinc-900 border border-red-800 p-6 text-center">
                    <p className="font-mono text-xs text-red-500 mb-2">Failed to load PDF</p>
                    <p className="font-mono text-[10px] text-zinc-400">Please check the console for details</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center h-[600px] bg-zinc-900 border border-zinc-800">
                      <p className="font-mono text-xs text-zinc-500">Loading page...</p>
                    </div>
                  }
                />
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-900 bg-[#131313]">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 font-mono text-xs uppercase py-2 px-4 border border-zinc-800 hover:bg-zinc-900 transition-colors ${
            currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        <div className="font-mono text-xs text-zinc-400">
          {issue.title} • Issue {issue.issueNumber}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === numPages}
          className={`flex items-center gap-2 font-mono text-xs uppercase py-2 px-4 border border-zinc-800 hover:bg-zinc-900 transition-colors ${
            currentPage === numPages ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          {!canAccessPage(Math.min(currentPage + 1, numPages)) ? (
            <>
              Unlock Premium <Lock className="w-4 h-4" />
            </>
          ) : (
            <>
              Next <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
