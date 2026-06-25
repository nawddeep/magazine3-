import React, { useState, useEffect } from 'react';
import TopNavBar from './components/TopNavBar';
import PublicReader from './components/PublicReader';
import MagazineSlider from './components/MagazineSlider';
import PDFReader from './components/PDFReader';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import UploadIssue from './components/UploadIssue';
import PerspectiveSwitcher from './PerspectiveSwitcher';
import PremiumModal from './components/PremiumModal';
import { MagazineIssue, AppView } from './types';
import { useAuth } from './context/AuthContext';

// Default initial visual dataset - Real magazines with proper metadata
const DEFAULT_ISSUES: MagazineIssue[] = [
  {
    id: 'rtc-oct-2005',
    title: 'RTC Magazine',
    category: 'Technology & Computing',
    issueNumber: '001',
    releaseDate: '2005-10-01',
    coverUrl: '/covers/rtc-magazine.svg',
    pageLimit: 84,
    description: 'Professional technology and computing magazine covering software development, hardware reviews, and industry insights from October 2005.',
    status: 'Published',
    views: '2,847',
    audience: '2,847',
    pdfUrl: '/pdfs/RTC_Magazine_October_2005.pdf'
  },
  {
    id: 'sadhana-mag',
    title: 'Sadhana Magazine',
    category: 'Spirituality & Lifestyle',
    issueNumber: '002',
    releaseDate: '2024-03-15',
    coverUrl: '/covers/sadhana-magazine.svg',
    pageLimit: 48,
    description: 'A contemplative publication exploring spiritual practices, mindfulness, and holistic living for modern seekers.',
    status: 'Published',
    views: '1,923',
    audience: '1,923',
    pdfUrl: '/pdfs/Sadhana_magazine.pdf'
  },
  {
    id: 'ellenna-mag',
    title: 'Ellenna Magazine',
    category: 'Fashion & Culture',
    issueNumber: '003',
    releaseDate: '2024-06-10',
    coverUrl: '/covers/ellenna-magazine.svg',
    pageLimit: 62,
    description: 'Contemporary fashion and cultural magazine featuring cutting-edge style editorials, designer interviews, and trend analysis.',
    status: 'Published',
    views: '3,654',
    audience: '3,654',
    pdfUrl: '/pdfs/ellenna_magazine.pdf'
  }
];

export default function App() {
  const { isAdmin, logout } = useAuth();
  const [view, setView] = useState<AppView>('public');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState('042');
  const [currentRoute, setCurrentRoute] = useState<'/' | '/admin/login' | '/admin/dashboard'>('/');
  const [viewMode, setViewMode] = useState<'editorial' | 'pdf'>('pdf'); // Default to PDF for real data
  
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return window.location.search.includes('debug=true') || localStorage.getItem('vanguard_debug') === 'true';
  });

  // Global keydown event to toggle debugMode on Ctrl+Shift+D or Alt+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyD' && e.shiftKey && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        setDebugMode((prev) => {
          const next = !prev;
          localStorage.setItem('vanguard_debug', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Also check URL parameters dynamically
  useEffect(() => {
    if (window.location.search.includes('debug=true')) {
      setDebugMode(true);
      localStorage.setItem('vanguard_debug', 'true');
    }
  }, []);

  const [issues, setIssues] = useState<MagazineIssue[]>(() => {
    const saved = localStorage.getItem('vanguard_issues');
    if (saved) {
      try {
        const parsedIssues = JSON.parse(saved);
        // Update PDF paths if they're using old /src/data paths
        const updatedIssues = parsedIssues.map((issue: MagazineIssue) => {
          if (issue.pdfUrl && issue.pdfUrl.startsWith('/src/data/')) {
            return {
              ...issue,
              pdfUrl: issue.pdfUrl.replace('/src/data/', '/pdfs/')
            };
          }
          return issue;
        });
        return updatedIssues;
      } catch (e) {
        console.error('Failed to parse cached issues dataset:', e);
      }
    }
    return DEFAULT_ISSUES;
  });

  // Initialize route from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin/login') {
      setCurrentRoute('/admin/login');
      setView('public');
    } else if (path === '/admin/dashboard') {
      if (isAdmin) {
        setCurrentRoute('/admin/dashboard');
        setView('admin');
      } else {
        // Redirect to login if not authenticated
        setCurrentRoute('/admin/login');
        setView('public');
        window.history.replaceState({}, '', '/admin/login');
      }
    } else {
      setCurrentRoute('/');
      setView('public');
    }
  }, []);

  // Protect admin dashboard route - redirect if not authenticated
  useEffect(() => {
    if (currentRoute === '/admin/dashboard' && !isAdmin) {
      setCurrentRoute('/admin/login');
      setView('public');
      window.history.replaceState({}, '', '/admin/login');
    }
  }, [isAdmin, currentRoute]);

  // Sync URL with route state
  useEffect(() => {
    if (currentRoute === '/admin/login') {
      window.history.pushState({}, '', '/admin/login');
    } else if (currentRoute === '/admin/dashboard') {
      window.history.pushState({}, '', '/admin/dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentRoute]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as '/' | '/admin/login' | '/admin/dashboard';
      
      if (path === '/admin/login') {
        setCurrentRoute('/admin/login');
        setView('public');
      } else if (path === '/admin/dashboard') {
        if (isAdmin) {
          setCurrentRoute('/admin/dashboard');
          setView('admin');
        } else {
          // Redirect to login if not authenticated
          setCurrentRoute('/admin/login');
          setView('public');
          window.history.replaceState({}, '', '/admin/login');
        }
      } else {
        setCurrentRoute('/');
        setView('public');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdmin]);

  // Keep issues database persistent across reloads
  useEffect(() => {
    localStorage.setItem('vanguard_issues', JSON.stringify(issues));
  }, [issues]);

  const handleToggleStatus = (issueId: string) => {
    setIssues((prev) => 
      prev.map((issue) => {
        if (issue.id === issueId) {
          const nextStatus = issue.status === 'Published' 
            ? 'Draft' 
            : issue.status === 'Draft' 
              ? 'Archived' 
              : 'Published';
          return { ...issue, status: nextStatus };
        }
        return issue;
      })
    );
  };

  const handleDeleteIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
  };

  const handleSaveIssue = (newIssue: MagazineIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setIsUploaderOpen(false);
    setView('public');
    // Scroll automatically to archive section to show newly created item!
    setTimeout(() => {
      const el = document.getElementById('archive-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Seeder helper to let users easily re-populate with fresh mocks
  const handleSeedMoreIssues = () => {
    setIssues(DEFAULT_ISSUES);
  };

  const activeIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const handleScrollToArchive = () => {
    setView('public');
    setCurrentRoute('/');
    setTimeout(() => {
      const el = document.getElementById('archive-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLoginSuccess = () => {
    setCurrentRoute('/admin/dashboard');
    setView('admin');
  };

  const handleBackToPublic = () => {
    setCurrentRoute('/');
    setView('public');
  };

  const handleLogout = () => {
    logout();
    setCurrentRoute('/');
    setView('public');
  };

  // Render admin login page
  if (currentRoute === '/admin/login') {
    return (
      <div id="vanguard-app-root" className="min-h-screen selection:bg-[#c3f400] selection:text-black" style={{ backgroundColor: 'var(--color-background)' }}>
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess}
          onBackToPublic={handleBackToPublic}
        />
      </div>
    );
  }

  // Render main app
  return (
    <div id="vanguard-app-root" className="min-h-screen selection:bg-[#c3f400] selection:text-black" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Upper global navigation bar */}
      {view !== 'slider' && !isUploaderOpen && currentRoute !== '/admin/login' && (
        <TopNavBar 
          currentView={view} 
          onViewChange={(v) => {
            if (v === 'admin') {
              // Check if user is authenticated before allowing admin access
              if (isAdmin) {
                setCurrentRoute('/admin/dashboard');
                setView(v);
              } else {
                // Redirect to login if not authenticated
                setCurrentRoute('/admin/login');
              }
            } else {
              setCurrentRoute('/');
              setView(v);
            }
            setIsUploaderOpen(false);
          }} 
          onSearch={setSearchQuery} 
          scrollToArchive={handleScrollToArchive}
          onLogoDoubleClick={() => {
            setDebugMode(prev => {
              const next = !prev;
              localStorage.setItem('vanguard_debug', String(next));
              return next;
            });
          }}
        />
      )}

      {/* Primary view routers */}
      {isUploaderOpen ? (
        <UploadIssue 
          onSaveIssue={handleSaveIssue} 
          onCancel={() => {
            setIsUploaderOpen(false);
            setView('admin');
            setCurrentRoute('/admin/dashboard');
          }}
        />
      ) : (
        <>
          {view === 'public' && (
            <PublicReader 
              issues={issues} 
              searchQuery={searchQuery}
              onViewChange={(v) => {
                if (v === 'admin') {
                  setCurrentRoute('/admin/dashboard');
                }
                setView(v);
              }}
              onSelectIssue={(issueId) => {
                setSelectedIssueId(issueId);
                setView('slider');
              }}
            />
          )}

          {view === 'slider' && viewMode === 'editorial' && (
            <MagazineSlider 
              issue={activeIssue} 
              onViewChange={(v) => {
                if (v === 'public') {
                  setCurrentRoute('/');
                }
                setView(v);
              }}
            />
          )}

          {view === 'slider' && viewMode === 'pdf' && activeIssue.pdfUrl && (
            <PDFReader 
              issue={activeIssue} 
              onViewChange={(v) => {
                if (v === 'public') {
                  setCurrentRoute('/');
                }
                setView(v);
              }}
            />
          )}

          {view === 'admin' && (
            <AdminDashboard 
              issues={issues}
              onToggleStatus={handleToggleStatus}
              onDeleteIssue={handleDeleteIssue}
              onAddIssueClick={() => setIsUploaderOpen(true)}
              onViewChange={(v) => {
                if (v === 'public') {
                  setCurrentRoute('/');
                }
                setView(v);
              }}
              onLogout={handleLogout}
            />
          )}
        </>
      )}

      {/* Master Interactive debugging & perspective switcher tool */}
      {debugMode && (
        <PerspectiveSwitcher 
          currentView={view} 
          onViewChange={(v) => {
            if (v === 'admin') {
              setCurrentRoute('/admin/dashboard');
            } else {
              setCurrentRoute('/');
            }
            setView(v);
            setIsUploaderOpen(false);
          }}
          activeIssueTitle={activeIssue?.title}
          onSeedMoreIssues={handleSeedMoreIssues}
        />
      )}

      {/* Global Premium Modal */}
      <PremiumModal />
    </div>
  );
}
