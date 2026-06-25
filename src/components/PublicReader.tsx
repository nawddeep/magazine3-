import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, TrendingUp, Sparkles, FolderOpen, Send, CheckCircle2, BookOpen, Layers, Info, X } from 'lucide-react';
import { MagazineIssue, AppView } from '../types';
import { useMagazineData } from '../hooks/useMagazineData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface PublicReaderProps {
  issues: MagazineIssue[];
  searchQuery: string;
  onViewChange: (view: AppView) => void;
  onSelectIssue: (issueId: string) => void;
}

export default function PublicReader({ issues, searchQuery, onViewChange, onSelectIssue }: PublicReaderProps) {
  // Slider states for Editors Pick
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [legalModalText, setLegalModalText] = useState<string | null>(null);
  const { latestIssue, loading, error } = useMagazineData();

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const trendingCardsRef = useRef<HTMLDivElement>(null);

  // Custom cursor follower state
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState('');

  // Editors Pick slides - dynamically generated from published issues
  const editorsPicks = issues
    .filter((issue) => issue.status === 'Published')
    .slice(0, 4)
    .map((issue) => ({
      id: issue.id,
      category: issue.category || 'Editorial',
      title: issue.title,
      img: issue.coverUrl,
    }));

  // Derived trending issues (sorted by numerical view count if possible)
  const trendingIssues = [...issues]
    .filter((issue) => issue.status === 'Published')
    .sort((a, b) => {
      const vA = parseInt(a.views.replace(/,/g, ''), 10) || 0;
      const vB = parseInt(b.views.replace(/,/g, ''), 10) || 0;
      return vB - vA;
    })
    .slice(0, 3);

  // Featured Issue is the latest issue, or default to the first issue
  const featuredIssue = latestIssue || issues.find(i => i.id === '042') || issues[0];

  // GSAP Hero Animation on mount
  useEffect(() => {
    if (heroRef.current && coverRef.current && featuredIssue) {
      const ctx = gsap.context(() => {
        // Animate hero content
        gsap.from('.hero-text', {
          opacity: 0,
          y: 50,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          delay: 0.2
        });

        // Animate magazine cover with 3D rotation
        gsap.from(coverRef.current, {
          opacity: 0,
          scale: 0.8,
          rotationY: -30,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.5
        });

        // Parallax effect on scroll
        gsap.to(coverRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: 100,
          rotationY: 10,
          ease: 'none'
        });
      }, heroRef);

      return () => ctx.revert();
    }
  }, [featuredIssue]);

  // GSAP Trending Cards Animation
  useEffect(() => {
    if (trendingCardsRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.trending-card', {
          scrollTrigger: {
            trigger: trendingCardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 60,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out'
        });
      }, trendingCardsRef);

      return () => ctx.revert();
    }
  }, [trendingIssues]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveSlide((prev) => Math.max(0, prev - 1));
    } else {
      setActiveSlide((prev) => Math.min(editorsPicks.length - 1, prev + 1));
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      const scrollAmount = activeSlide * 474; // Card width 450 + margin 24
      sliderRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [activeSlide]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setEmailSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setEmailSubmitted(false);
      }, 5000);
    }
  };

  // Filter issues based on search query
  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      issue.issueNumber.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Premium Custom Cursor Effect */}
      <div 
        id="cursor-follower"
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] opacity-0 md:opacity-100 transition-all duration-200 mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform flex items-center justify-center ${
          cursorText 
            ? 'w-14 h-14 bg-[#c3f400] text-black border-none scale-100' 
            : 'w-8 h-8 border-2 border-white scale-100'
        }`}
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          opacity: mousePos.x === -100 ? 0 : 1
        }}
      >
        {cursorText && (
          <span className="font-mono text-[9px] font-black tracking-wider text-black select-none uppercase">
            {cursorText}
          </span>
        )}
      </div>

      <main className="pt-20 bg-theme text-theme transition-colors duration-300" id="landing-main-stage">
        {/* Editorial Hero Grid Section */}
        <section ref={heroRef} className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden px-6 md:px-[8vw] py-12 md:py-20 border-b border-theme-secondary">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column: Editorial Directive */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between border-r border-theme-secondary pr-8 py-2 hero-text">
              <div>
                <span className="font-mono text-[10px] text-theme-muted tracking-[0.3em] uppercase block mb-6 font-bold">
                  Editorial Directive
                </span>
                <ul className="space-y-4">
                  {[
                    { tag: '01', name: 'Frontier Issues' },
                    { tag: '02', name: 'Tokyo Club Pulse' },
                    { tag: '03', name: 'Subterranean Brutalism' },
                    { tag: '04', name: 'Experimental Technicalwear' }
                  ].map((cat, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => {
                        const el = document.getElementById('archive-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group cursor-pointer flex items-center gap-3 py-1"
                    >
                      <span className="font-mono text-[10px] text-theme-tertiary group-hover:text-[#c3f400] transition-colors font-bold">
                        {cat.tag}
                      </span>
                      <span className="font-sans text-xs text-theme-secondary group-hover:text-[var(--color-primary-hover)] transition-colors uppercase font-medium tracking-wide">
                        {cat.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-[9px] text-[#c3f400] tracking-widest uppercase block mb-2 font-bold accent-glow animate-pulse">
                  Ingress Status // ACTIVE
                </span>
                <p className="font-sans text-[11px] text-theme-muted leading-relaxed uppercase">
                  Continuous publishing network online. Custom issue sets compiled via local zine database.
                </p>
              </div>
            </div>

            {/* Center Column: Magazine Cover 3D Mockup */}
            <div className="lg:col-span-6 flex items-center justify-center py-8 lg:py-0">
              {featuredIssue ? (
                <div 
                  ref={coverRef}
                  onClick={() => { onSelectIssue(featuredIssue.id); onViewChange('slider'); }}
                  onMouseEnter={() => setCursorText("READ")}
                  onMouseLeave={() => setCursorText("")}
                  className="zine-cover-container w-[260px] sm:w-[320px] md:w-[350px] aspect-[3/4] cursor-pointer group"
                >
                  <div className="zine-cover-3d w-full h-full relative overflow-hidden bg-theme-surface-elevated rounded-sm border border-theme-secondary">
                    <div className="zine-spine" />
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
                      alt={featuredIssue.title}
                      src={featuredIssue.coverUrl}
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-all duration-700" />
                    <div className="zine-page-edge" />
                  </div>
                </div>
              ) : (
                <div className="skeleton-shimmer w-[300px] h-[400px] border border-theme-secondary" />
              )}
            </div>

            {/* Right Column: Issue Details Dispatch */}
            <div className="lg:col-span-3 flex flex-col justify-between py-2 lg:pl-8 border-t lg:border-t-0 lg:border-l border-theme-secondary pt-8 lg:pt-0 hero-text">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 skeleton-shimmer w-1/2 rounded" />
                  <div className="h-10 skeleton-shimmer w-3/4 rounded" />
                  <div className="h-20 skeleton-shimmer rounded" />
                </div>
              ) : error ? (
                <p className="text-red-400 font-mono text-xs">{error}</p>
              ) : featuredIssue ? (
                <div className="space-y-6 flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="font-mono text-[10px] text-[#c3f400] tracking-[0.25em] uppercase font-bold accent-glow block mb-2">
                        LATEST RELEASE // NO. {featuredIssue.issueNumber}
                      </span>
                      <h1 className="font-serif font-black text-5xl md:text-6xl leading-[0.9] tracking-tighter text-theme uppercase italic">
                        {featuredIssue.title}
                      </h1>
                    </div>
                    <p className="font-sans text-xs text-theme-secondary leading-relaxed">
                      {featuredIssue.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="font-mono text-[10px] text-theme-tertiary space-y-2 uppercase">
                      <div className="flex justify-between border-b border-theme-secondary pb-1.5">
                        <span>Released</span>
                        <span className="text-theme font-bold">{featuredIssue.releaseDate}</span>
                      </div>
                      <div className="flex justify-between border-b border-theme-secondary pb-1.5">
                        <span>Paginator</span>
                        <span className="text-theme font-bold">{featuredIssue.pageLimit} Pages</span>
                      </div>
                      <div className="flex justify-between border-b border-theme-secondary pb-1.5">
                        <span>Views</span>
                        <span className="text-theme font-bold">{featuredIssue.views}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { onSelectIssue(featuredIssue.id); onViewChange('slider'); }}
                      onMouseEnter={() => setCursorText("OPEN")}
                      onMouseLeave={() => setCursorText("")}
                      className="cursor-pointer group flex items-center justify-between w-full border border-theme-strong hover:border-[#c3f400] text-theme hover:text-black hover:bg-[#c3f400] px-6 py-4 font-mono text-xs uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400]"
                    >
                      <span>Read Cover Issue</span>
                      <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-theme-muted font-mono text-xs">No issues found.</p>
              )}
            </div>

          </div>
        </section>

        {/* Horizontal Editorial Marquee */}
        <section className="border-b border-theme-secondary py-6 overflow-hidden bg-theme-secondary select-none">
          <div className="animate-marquee whitespace-nowrap">
            <div className="inline-flex gap-16 px-8">
              <span className="font-serif text-2xl md:text-3xl text-outline italic uppercase tracking-wider">TRENDING INDEX</span>
              <span className="font-serif text-2xl md:text-3xl text-[#c3f400] font-black uppercase tracking-wider">SHIBUYA SUBTERRANEAN CORRIDORS</span>
              <span className="font-serif text-2xl md:text-3xl text-outline italic uppercase tracking-wider">TRENDING INDEX</span>
              <span className="font-serif text-2xl md:text-3xl text-[#c3f400] font-black uppercase tracking-wider">BRUTALIST FASHION SCENE</span>
              <span className="font-serif text-2xl md:text-3xl text-outline italic uppercase tracking-wider">TRENDING INDEX</span>
              <span className="font-serif text-2xl md:text-3xl text-[#c3f400] font-black uppercase tracking-wider">EXPERIMENTAL LIQUID FORM GRAPHICS</span>
            </div>
            {/* Duplicate for seamless infinite loop */}
            <div className="inline-flex gap-16 px-8">
              <span className="font-serif text-2xl md:text-3xl text-outline italic uppercase tracking-wider">TRENDING INDEX</span>
              <span className="font-serif text-2xl md:text-3xl text-[#c3f400] font-black uppercase tracking-wider">SHIBUYA SUBTERRANEAN CORRIDORS</span>
              <span className="font-serif text-2xl md:text-3xl text-outline italic uppercase tracking-wider">TRENDING INDEX</span>
              <span className="font-serif text-2xl md:text-3xl text-[#c3f400] font-black uppercase tracking-wider">BRUTALIST FASHION SCENE</span>
              <span className="font-serif text-2xl md:text-3xl text-outline italic uppercase tracking-wider">TRENDING INDEX</span>
              <span className="font-serif text-2xl md:text-3xl text-[#c3f400] font-black uppercase tracking-wider">EXPERIMENTAL LIQUID FORM GRAPHICS</span>
            </div>
          </div>
        </section>

        {/* Trending Issues Section */}
        <section id="trending-section" ref={trendingCardsRef} className="py-24 px-6 md:px-[8vw] border-b border-theme-secondary bg-theme-secondary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="font-mono text-xs text-[#c3f400] tracking-[0.3em] uppercase block mb-3 font-bold">Popular Dispatches</span>
              <h2 className="font-serif font-black text-4xl md:text-6xl uppercase tracking-tighter text-theme leading-none italic font-extrabold">
                Trending Issues
              </h2>
            </div>
            <p className="font-sans text-xs text-theme-secondary max-w-sm leading-relaxed uppercase">
              The highest performing editorial publications and technical releases within the Vanguard network this month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingIssues.map((issue, index) => (
              <div 
                key={issue.id}
                onClick={() => { onSelectIssue(issue.id); onViewChange('slider'); }}
                onMouseEnter={() => setCursorText("READ")}
                onMouseLeave={() => setCursorText("")}
                className="trending-card group flex flex-col justify-between p-6 border border-theme-secondary bg-theme-card hover:border-[var(--color-accent)]/60 transition-all duration-300 cursor-pointer h-full shadow-theme-sm hover:shadow-theme-md hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-theme-secondary pb-4">
                    <span className="font-serif text-4xl font-black text-outline transition-all duration-500 group-hover:text-[#c3f400]">
                      0{index + 1}
                    </span>
                    <div className="w-14 h-18 overflow-hidden bg-theme-surface-elevated border border-theme-secondary shrink-0">
                      <img 
                        src={issue.coverUrl} 
                        alt={issue.title} 
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[9px] text-[#c3f400] tracking-widest uppercase font-bold">
                        ISSUE {issue.issueNumber}
                      </span>
                      {issue.category && (
                        <span className="font-mono text-[9px] text-theme-tertiary tracking-widest uppercase">
                          • {issue.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-theme uppercase tracking-tight group-hover:text-[#c3f400] transition-colors leading-tight">
                      {issue.title}
                    </h3>
                    <p className="font-sans text-xs text-theme-secondary line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-theme-secondary flex items-center justify-between text-theme-tertiary font-mono text-[10px]">
                  <span>{issue.releaseDate}</span>
                  <span className="text-theme group-hover:text-[#c3f400] transition-colors flex items-center gap-1">
                    OPEN ZINE <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Magazine Showcase */}
        {featuredIssue && (
          <section id="featured-magazine" className="py-24 md:py-32 px-6 md:px-[8vw] bg-theme border-b border-theme-secondary">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Left Column: Magazine Cover 3D */}
              <div className="lg:col-span-5 flex justify-center">
                <div 
                  onClick={() => { onSelectIssue(featuredIssue.id); onViewChange('slider'); }}
                  onMouseEnter={() => setCursorText("EXPLORE")}
                  onMouseLeave={() => setCursorText("")}
                  className="zine-cover-container w-[280px] sm:w-[350px] aspect-[3/4] cursor-pointer group"
                >
                  <div className="zine-cover-3d w-full h-full relative overflow-hidden bg-theme-surface-elevated border border-theme-secondary shadow-2xl rounded-sm">
                    <div className="zine-spine" />
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
                      alt={featuredIssue.title}
                      src={featuredIssue.coverUrl}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                    <div className="zine-page-edge" />
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Details */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <span className="font-mono text-xs text-[#c3f400] tracking-[0.3em] uppercase block font-bold">
                    Featured Publication Showcase
                  </span>
                  <h2 className="font-serif font-black text-5xl md:text-7xl uppercase text-theme leading-none tracking-tighter italic font-extrabold">
                    {featuredIssue.title}
                  </h2>
                  <p className="font-sans text-sm text-theme-secondary leading-relaxed max-w-2xl">
                    Our lead publication showcases cutting-edge editorial and tech studies. This digital zine covers structural urban studies, advanced high-contrast streetwear styling, and immersive user paginators built in collaboration with leading technical artists.
                  </p>
                </div>

                {/* Table of Contents Grid */}
                <div className="border-y border-theme-secondary py-6 max-w-2xl">
                  <span className="font-mono text-[10px] text-theme-muted tracking-widest uppercase block mb-4 font-bold">
                    Inside This Volume
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { num: '01', title: 'Subterranean corridors & club design', page: 'P. 12' },
                      { num: '02', title: 'Brutalist photography & techno studies', page: 'P. 28' },
                      { num: '03', title: 'Early 2000s cyberware hardware layouts', page: 'P. 44' },
                      { num: '04', title: 'Liquid form modeling & neon armor design', page: 'P. 60' }
                    ].map((toc, index) => (
                      <div key={index} className="flex justify-between items-center text-xs border-b border-theme-secondary pb-2">
                        <span className="font-mono text-theme-muted">{toc.num}</span>
                        <span className="font-sans text-theme-secondary truncate max-w-[180px] md:max-w-[220px] ml-2 text-left">{toc.title}</span>
                        <span className="font-mono text-[#c3f400] text-[10px] font-bold">{toc.page}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <button
                    onClick={() => { onSelectIssue(featuredIssue.id); onViewChange('slider'); }}
                    onMouseEnter={() => setCursorText("READ")}
                    onMouseLeave={() => setCursorText("")}
                    className="cursor-pointer group bg-[var(--color-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent)] hover:text-black px-10 py-5 font-mono text-xs uppercase tracking-widest transition-all duration-300 font-bold flex items-center gap-3 border border-[var(--color-primary)] hover:border-[var(--color-accent)] shadow-theme-md hover:shadow-theme-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f400]"
                  >
                    <span>Read Immersive Layout</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center gap-4 text-xs font-mono text-theme-tertiary">
                    <div>
                      <span className="block text-theme font-bold">{featuredIssue.pageLimit} pages</span>
                      <span>Format</span>
                    </div>
                    <div className="w-px h-6 bg-theme-secondary" />
                    <div>
                      <span className="block text-theme font-bold">100% Secure</span>
                      <span>DRM Checked</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* Editors Pick Horizontal Slider Section */}
        <section id="editors-pick" className="py-24 md:py-32 px-6 md:px-[8vw] overflow-hidden border-b border-theme-secondary bg-theme-secondary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <span className="font-mono text-xs text-[#c3f400] tracking-[0.3em] uppercase block mb-3 font-bold">Curated Perspective</span>
              <h2 className="font-serif font-black text-4xl md:text-6xl uppercase tracking-tighter text-theme leading-none italic font-extrabold">
                Editors Pick
              </h2>
            </div>
            
            {/* Elegant Slider Arrows */}
            <div className="flex gap-4 self-end">
              <button 
                onClick={() => handleScroll('left')}
                disabled={activeSlide === 0}
                onMouseEnter={() => setCursorText("PREV")}
                onMouseLeave={() => setCursorText("")}
                className={`w-12 h-12 flex items-center justify-center border border-theme-secondary text-theme hover:border-[var(--color-primary-hover)] transition-all rounded-full ${
                  activeSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
                }`}
                aria-label="Previous story slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleScroll('right')}
                disabled={activeSlide === editorsPicks.length - 1}
                onMouseEnter={() => setCursorText("NEXT")}
                onMouseLeave={() => setCursorText("")}
                className={`w-12 h-12 flex items-center justify-center border border-theme-secondary text-theme hover:border-[var(--color-primary-hover)] transition-all rounded-full ${
                  activeSlide === editorsPicks.length - 1 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
                }`}
                aria-label="Next story slide"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div 
            ref={sliderRef}
            className="flex gap-8 overflow-x-auto liquid-scroll pb-10 scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {editorsPicks.map((pick) => (
              <div 
                key={pick.id}
                onClick={() => {
                  onSelectIssue(pick.id);
                  onViewChange('slider');
                }}
                onMouseEnter={() => setCursorText("VIEW")}
                onMouseLeave={() => setCursorText("")}
                className="flex-none w-[280px] md:w-[400px] group cursor-pointer scroll-snap-align"
              >
                <div className="aspect-[3/4] overflow-hidden bg-theme-surface-elevated border border-theme-secondary relative mb-4 rounded-sm">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                    alt={pick.title}
                    src={pick.img}
                  />
                  <div className="absolute inset-0 bg-[#c3f400]/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-mono text-xs uppercase bg-[var(--color-background)] text-theme px-4 py-2 font-bold flex items-center gap-1.5 shadow-xl border border-theme-secondary">
                      READ STORY <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-[#c3f400] uppercase mb-2 font-bold tracking-widest">{pick.category}</p>
                <h3 className="font-serif text-lg md:text-xl font-bold tracking-tight transition-all uppercase leading-snug text-theme group-hover:text-[#c3f400] duration-350">
                  {pick.title}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* Bento Grid: The Archive */}
        <section id="archive-section" className="bg-theme py-24 md:py-32 px-6 md:px-[8vw] border-b border-theme-secondary">
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-[#c3f400] tracking-[0.3em] uppercase block mb-4 font-bold">Historic Chronology</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase text-theme tracking-tighter leading-none italic font-extrabold">
              The Archive
            </h2>
            {searchQuery && (
              <p className="mt-4 font-mono text-[10px] text-theme-secondary uppercase tracking-widest bg-theme-secondary inline-block px-4 py-2 border border-theme-secondary rounded">
                FILTERING INDEX FOR: "{searchQuery}" — {filteredIssues.length} ISSUES FOUND
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dynamic Grid Mapping all filtered items */}
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                onClick={() => {
                  onSelectIssue(issue.id);
                  onViewChange('slider');
                }}
                onMouseEnter={() => setCursorText("OPEN")}
                onMouseLeave={() => setCursorText("")}
                className="border border-theme-secondary hover:border-[var(--color-accent)] pb-6 cursor-pointer group flex flex-col justify-between transition-all duration-350 bg-theme-card p-6 rounded-sm shadow-theme-sm hover:shadow-theme-md"
              >
                <div className="space-y-4">
                  <div className="w-full h-64 overflow-hidden bg-theme-surface-elevated border border-theme-secondary rounded-sm">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                      alt={issue.title}
                      src={issue.coverUrl}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[9px] text-[#c3f400] tracking-widest font-bold uppercase bg-theme-secondary px-2 py-0.5 inline-block border border-theme-secondary rounded-sm">
                        ISSUE {issue.issueNumber}
                      </span>
                      {issue.category && (
                        <span className="font-mono text-[9px] text-theme-secondary tracking-widest uppercase bg-theme-secondary px-2 py-0.5 inline-block border border-theme-secondary rounded-sm">
                          {issue.category}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-lg font-bold text-theme uppercase tracking-tight group-hover:text-[#c3f400] transition-colors leading-tight">
                      {issue.title}
                    </h4>
                    <p className="text-theme-secondary font-sans text-xs leading-relaxed line-clamp-3">
                      {issue.description || "Vanguard digital publications showcasing state-of-the-art technical concepts."}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between font-mono text-[10px] text-theme-muted pt-4 border-t border-theme-secondary">
                  <span>{issue.releaseDate}</span>
                  <span className="text-theme group-hover:text-[#c3f400] transition-colors">{issue.audience} views</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Subscription block */}
        <section className="py-24 md:py-32 px-6 md:px-[8vw] bg-[#c3f400] text-black border-b border-theme-secondary">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <span className="font-mono text-xs tracking-[0.3em] font-black uppercase text-zinc-900 block">
                Weekly Vanguard Dispatch
              </span>
              <h2 className="font-serif font-black text-5xl md:text-7xl leading-none uppercase italic tracking-tighter text-black">
                Join the Avant-Garde
              </h2>
              <p className="font-sans text-sm text-zinc-800 max-w-xl mx-auto leading-relaxed font-medium">
                Subscribe to receive weekly dispatches detailing technically-woven apparel systems, Tokyo architectural photography, and digital art projects.
              </p>
            </div>
            
            {!emailSubmitted ? (
              <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto items-center">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border-b-2 border-black font-serif text-xl placeholder:text-zinc-800/60 focus:outline-none focus:border-zinc-950 focus:ring-0 py-3 text-center md:text-left transition-colors"
                  aria-label="Email address for newsletter subscription"
                />
                <button 
                  type="submit"
                  onMouseEnter={() => setCursorText("JOIN")}
                  onMouseLeave={() => setCursorText("")}
                  className="cursor-pointer w-full md:w-auto bg-black text-[#c3f400] hover:bg-white hover:text-black px-10 py-4 font-mono text-xs tracking-widest font-black uppercase transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="bg-black text-[#c3f400] p-6 border-2 border-[#c3f400] flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto rounded-sm shadow-theme-lg transition-all animate-fade-in-up">
                <CheckCircle2 className="w-8 h-8 text-[#c3f400]" />
                <div className="text-center md:text-left">
                  <h4 className="font-mono text-sm font-black uppercase">Ingress Subscribed</h4>
                  <p className="font-mono text-[9px] text-white uppercase mt-0.5">
                    Welcome to the network. Confirm your verification via inbox.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Main Footer */}
      <footer className="w-full bg-theme-secondary flex flex-col items-center justify-center py-16 px-6 md:px-[8vw] text-center border-t border-theme-secondary select-none text-theme">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-serif font-black text-4xl text-theme tracking-[0.2em] mb-6 hover:italic transition-all duration-350 cursor-pointer"
        >
          VANGUARD
        </div>
        
        <div className="flex flex-wrap gap-8 justify-center mb-8 font-mono text-[10px] text-theme-secondary uppercase tracking-widest">
          <button 
            onClick={() => setLegalModalText("Vanguard Network collects local storage preferences to persist configuration datasets. No personal logs or browsing files are transmitted. Security Level 10 protocol declared.")}
            className="hover:text-[#c3f400] transition-all cursor-pointer focus:outline-none"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setLegalModalText("Vanguard is an independent digital magazine platform. All editorial assets, layouts, and vector covers are curated under public-domain or open-source digital copyrights.")}
            className="hover:text-[#c3f400] transition-all cursor-pointer focus:outline-none"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => setLegalModalText("Communications can be directed to: ingress@vanguard.editorial or the Platform command center CMS dashboard.")}
            className="hover:text-[#c3f400] transition-all cursor-pointer focus:outline-none"
          >
            Contact Ingress
          </button>
          <button 
            onClick={() => setLegalModalText("Vanguard Editorial Hub accommodates zero commercial advertising to preserve our clean, high-contrast brutalist design layout.")}
            className="hover:text-[#c3f400] transition-all cursor-pointer focus:outline-none"
          >
            Advertise
          </button>
        </div>
        
        <p className="font-mono text-[9px] text-theme-muted tracking-[0.3em] uppercase">
          ©2026 Vanguard Digital Media Corp. All rights reserved. Secure network connection declared.
        </p>
      </footer>

      {/* Interactive Legal Modal */}
      {legalModalText && (
        <div 
          className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLegalModalText(null)}
        >
          <div 
            className="bg-theme border-4 border-[#c3f400] max-w-md w-full p-6 relative shadow-theme-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setLegalModalText(null)}
              className="absolute top-4 right-4 text-theme-secondary hover:text-theme transition-colors"
              aria-label="Close document modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-serif font-black text-xl uppercase italic tracking-tight text-theme border-b border-theme-secondary pb-3 mb-4">
              Vanguard Document
            </h4>
            <p className="font-mono text-xs leading-relaxed text-theme-secondary uppercase">
              {legalModalText}
            </p>
            <button 
              onClick={() => setLegalModalText(null)}
              className="mt-6 w-full bg-[#c3f400] text-black font-mono text-xs uppercase font-bold py-2.5 hover:bg-theme-secondary hover:text-theme transition-colors border border-[#c3f400]"
            >
              Acknowledge Ingress
            </button>
          </div>
        </div>
      )}
    </>
  );
}
