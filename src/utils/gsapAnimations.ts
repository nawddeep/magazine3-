import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Fade in from bottom animation
 */
export const fadeInUp = (element: HTMLElement | string, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  });
};

/**
 * Fade in with scale animation
 */
export const fadeInScale = (element: HTMLElement | string, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    scale: 0.8,
    duration: 1,
    ease: 'back.out(1.7)',
    ...options
  });
};

/**
 * Staggered fade in for multiple elements
 */
export const staggerFadeIn = (elements: string, options = {}) => {
  return gsap.from(elements, {
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
    ...options
  });
};

/**
 * Parallax scroll effect
 */
export const parallaxScroll = (element: HTMLElement | string, options: any = {}) => {
  return gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      ...(options.scrollTrigger || {})
    },
    y: 100,
    ease: 'none',
    ...options
  });
};

/**
 * Magnetic hover effect for buttons
 */
export const magneticHover = (element: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Text reveal animation (letter by letter)
 */
export const textReveal = (element: HTMLElement | string, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 100,
    rotationX: -90,
    transformOrigin: 'center bottom',
    duration: 1,
    ease: 'power4.out',
    ...options
  });
};

/**
 * Image zoom on scroll
 */
export const imageZoomScroll = (element: HTMLElement | string, options: any = {}) => {
  return gsap.fromTo(
    element,
    { scale: 1.2 },
    {
      scale: 1,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1,
        ...(options.scrollTrigger || {})
      },
      ease: 'none',
      ...options
    }
  );
};

/**
 * Smooth page transition
 */
export const pageTransition = (onComplete?: () => void) => {
  const tl = gsap.timeline({
    onComplete
  });

  tl.to('.page-transition-overlay', {
    scaleY: 1,
    duration: 0.5,
    ease: 'power3.in',
    transformOrigin: 'bottom'
  }).to('.page-transition-overlay', {
    scaleY: 0,
    duration: 0.5,
    ease: 'power3.out',
    transformOrigin: 'top',
    delay: 0.2
  });

  return tl;
};

/**
 * Card flip animation
 */
export const cardFlip = (element: HTMLElement | string, options = {}) => {
  return gsap.to(element, {
    rotationY: 180,
    duration: 0.6,
    ease: 'power2.inOut',
    ...options
  });
};

/**
 * Smooth scroll to element
 */
export const smoothScrollTo = (target: string | HTMLElement, options = {}) => {
  return gsap.to(window, {
    scrollTo: {
      y: target,
      autoKill: true,
      offsetY: 80
    },
    duration: 1,
    ease: 'power3.inOut',
    ...options
  });
};

/**
 * Blob/Morph animation for custom cursor
 */
export const cursorBlob = (element: HTMLElement, x: number, y: number) => {
  return gsap.to(element, {
    x: x - element.offsetWidth / 2,
    y: y - element.offsetHeight / 2,
    duration: 0.3,
    ease: 'power2.out'
  });
};

/**
 * Counter animation for numbers
 */
export const animateCounter = (
  element: HTMLElement,
  start: number,
  end: number,
  options = {}
) => {
  const obj = { value: start };
  
  return gsap.to(obj, {
    value: end,
    duration: 2,
    ease: 'power1.inOut',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString();
    },
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    ...options
  });
};

/**
 * Split text animation utility
 */
export const splitTextAnimation = (element: HTMLElement, options = {}) => {
  const text = element.textContent || '';
  const chars = text.split('');
  
  element.innerHTML = chars
    .map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
    .join('');

  return gsap.from(element.querySelectorAll('.char'), {
    opacity: 0,
    y: 50,
    rotationX: -90,
    stagger: 0.02,
    duration: 0.8,
    ease: 'back.out(1.7)',
    ...options
  });
};

export default {
  fadeInUp,
  fadeInScale,
  staggerFadeIn,
  parallaxScroll,
  magneticHover,
  textReveal,
  imageZoomScroll,
  pageTransition,
  cardFlip,
  smoothScrollTo,
  cursorBlob,
  animateCounter,
  splitTextAnimation
};
