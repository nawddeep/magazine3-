import React, { useState } from 'react';
import { Search, User, X, BookOpen, Film, Radio, Layers, Sun, Moon, Menu } from 'lucide-react';
import { AppView } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TopNavBarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onSearch: (query: string) => void;
  scrollToArchive?: () => void;
  onLogoDoubleClick?: () => void;
}

export default function TopNavBar({ currentView, onViewChange, onSearch, scrollToArchive, onLogoDoubleClick }: TopNavBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onSearch('');
  };

  return (
    <>
      <nav
        id="vanguard-top-navbar"
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b-2 transition-all duration-300 flex justify-between items-center px-6 md:px-[5vw] py-4 h-20"
        style={{
          backgroundColor: 'var(--color-navbar-bg)',
          borderColor: 'var(--color-navbar-border)'
        }}
      >
        {/* Brand Logo */}
        <div
          className="font-serif font-black text-3xl md:text-4xl tracking-tighter cursor-pointer hover:italic select-none transition-colors"
          style={{ color: 'var(--color-primary)' }}
          onClick={() => {
            onViewChange('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDoubleClick={onLogoDoubleClick}
          id="nav-brand-logo"
        >
          VANGUARD
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex gap-10 items-center justify-center">
          <button
            onClick={() => { onViewChange('public'); }}
            className={`font-sans text-sm md:text-base font-semibold tracking-wider transition-all duration-300 ${currentView === 'public' ? 'border-b-2 pb-1 font-bold' : 'hover:text-[#c3f400]'}`}
            style={{
              color: currentView === 'public' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderColor: currentView === 'public' ? 'var(--color-accent)' : 'transparent'
            }}
          >
            Latest
          </button>
          <button
            onClick={() => { onViewChange('public'); setTimeout(() => { const el = document.getElementById('editors-pick'); el?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
            className="font-sans text-sm md:text-base font-semibold tracking-wider hover:text-[#c3f400] transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Culture
          </button>
          <button
            onClick={() => { onViewChange('public'); setTimeout(() => { const el = document.getElementById('editors-pick'); el?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
            className="font-sans text-sm md:text-base font-semibold tracking-wider hover:text-[#c3f400] transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Style
          </button>
          <button
            onClick={() => {
              if (scrollToArchive) {
                scrollToArchive();
              } else {
                onViewChange('public');
                setTimeout(() => {
                  const el = document.getElementById('archive-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className={`font-sans text-sm md:text-base font-semibold tracking-wider transition-all duration-300 ${currentView === 'slider' ? 'border-b-2 pb-1 font-bold' : 'hover:text-[#c3f400]'}`}
            style={{
              color: currentView === 'slider' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderColor: currentView === 'slider' ? 'var(--color-accent)' : 'transparent'
            }}
          >
            Archive
          </button>
        </div>

        {/* Icons Area */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hover:text-[#c3f400] transition-colors focus:outline-none"
            style={{ color: 'var(--color-primary)' }}
            title="Search Platform"
            id="btn-nav-search"
            aria-label="Search Catalog"
          >
            <Search className="w-7 h-7" />
          </button>

          <button
            onClick={() => {
              // Navigate to admin using onViewChange instead of full reload
              onViewChange('admin');
            }}
            className="transition-all hover:text-[#c3f400]"
            style={{ color: currentView === 'admin' ? 'var(--color-accent)' : 'var(--color-primary)' }}
            title="Editorial CMS Command Center"
            id="btn-nav-admin"
            aria-label="Admin Access Portal"
          >
            <User className="w-7 h-7" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hover:text-[#c3f400] transition-colors focus:outline-none"
            style={{ color: 'var(--color-primary)' }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} visual theme`}
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden hover:text-[#c3f400] transition-colors focus:outline-none"
            style={{ color: 'var(--color-primary)' }}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed top-20 left-0 w-full z-45 border-b-2 md:hidden flex flex-col p-6 gap-4 backdrop-blur-lg transition-all duration-300"
          style={{
            backgroundColor: 'var(--color-navbar-bg)',
            borderColor: 'var(--color-navbar-border)'
          }}
        >
          <button
            onClick={() => { onViewChange('public'); setIsMobileMenuOpen(false); }}
            className={`font-sans text-left py-2 font-semibold tracking-wider transition-colors ${currentView === 'public' ? 'text-[#c3f400] font-bold' : ''}`}
            style={{ color: currentView === 'public' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            Latest
          </button>
          <button
            onClick={() => { 
              onViewChange('public'); 
              setIsMobileMenuOpen(false);
              setTimeout(() => { const el = document.getElementById('editors-pick'); el?.scrollIntoView({ behavior: 'smooth' }); }, 200); 
            }}
            className="font-sans text-left py-2 font-semibold tracking-wider hover:text-[#c3f400] transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Culture
          </button>
          <button
            onClick={() => { 
              onViewChange('public'); 
              setIsMobileMenuOpen(false);
              setTimeout(() => { const el = document.getElementById('editors-pick'); el?.scrollIntoView({ behavior: 'smooth' }); }, 200); 
            }}
            className="font-sans text-left py-2 font-semibold tracking-wider hover:text-[#c3f400] transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Style
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (scrollToArchive) {
                scrollToArchive();
              } else {
                onViewChange('public');
                setTimeout(() => {
                  const el = document.getElementById('archive-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }
            }}
            className={`font-sans text-left py-2 font-semibold tracking-wider transition-colors ${currentView === 'slider' ? 'text-[#c3f400] font-bold' : ''}`}
            style={{ color: currentView === 'slider' ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            Archive
          </button>
        </div>
      )}

      {/* Slide-out Search Overlay */}
      {isSearchOpen && (
        <div
          id="search-overlay"
          className="fixed inset-0 z-[100] flex flex-col justify-center px-6 md:px-[10vw]"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div className="absolute top-6 right-6 md:right-[5vw]">
            <button
              onClick={handleCloseSearch}
              className="cursor-pointer p-2 border-2 border-transparent hover:border-[#c3f400] transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="max-w-4xl w-full mx-auto">
            <span className="font-mono text-xs text-[#c3f400] tracking-[0.2em] uppercase block mb-3">
              VANGUARD KINETIC SEARCH ENGINE
            </span>
            <form onSubmit={handleSearchSubmit} className="relative flex border-b-4 lg:border-b-8" style={{ borderColor: 'var(--color-navbar-border)' }}>
              <input
                type="text"
                placeholder="TYPE KEYWORD (E.G. TECHNOLOGY, FASHION, SPIRITUALITY...)"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full bg-transparent font-serif font-black text-2xl md:text-5xl lg:text-6xl uppercase tracking-tighter py-4 focus:outline-none select-all"
                style={{ 
                  color: 'var(--color-text-primary)',
                  caretColor: 'var(--color-accent)'
                }}
              />
              <button
                type="submit"
                className="bg-[#c3f400] text-black px-6 md:px-10 flex items-center justify-center hover:bg-white transition-colors"
              >
                <Search className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </form>
            <p className="font-mono text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
              PRESS ENTER OR TYPE TO FILTER MAGAZINE ISSUES BY CATEGORY OR KEYWORD.
            </p>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                onClick={() => { setSearchQuery('Technology'); onSearch('Technology'); }}
                className="p-4 cursor-pointer transition-all"
                style={{
                  border: '2px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-surface-elevated)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c3f400'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
              >
                <BookOpen className="w-5 h-5 text-[#c3f400] mb-2" />
                <span className="font-mono text-xs uppercase font-bold block" style={{ color: 'var(--color-text-primary)' }}>Technology</span>
              </div>
              <div
                onClick={() => { setSearchQuery('Fashion'); onSearch('Fashion'); }}
                className="p-4 cursor-pointer transition-all"
                style={{
                  border: '2px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-surface-elevated)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c3f400'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
              >
                <Film className="w-5 h-5 text-[#c3f400] mb-2" />
                <span className="font-mono text-xs uppercase font-bold block" style={{ color: 'var(--color-text-primary)' }}>Fashion</span>
              </div>
              <div
                onClick={() => { setSearchQuery('Spirituality'); onSearch('Spirituality'); }}
                className="p-4 cursor-pointer transition-all"
                style={{
                  border: '2px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-surface-elevated)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c3f400'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
              >
                <Radio className="w-5 h-5 text-[#c3f400] mb-2" />
                <span className="font-mono text-xs uppercase font-bold block" style={{ color: 'var(--color-text-primary)' }}>Spirituality</span>
              </div>
              <div
                onClick={() => { setSearchQuery('Lifestyle'); onSearch('Lifestyle'); }}
                className="p-4 cursor-pointer transition-all"
                style={{
                  border: '2px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-surface-elevated)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c3f400'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
              >
                <Layers className="w-5 h-5 text-[#c3f400] mb-2" />
                <span className="font-mono text-xs uppercase font-bold block" style={{ color: 'var(--color-text-primary)' }}>Lifestyle</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
