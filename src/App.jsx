import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import ThreeHero from './components/ThreeHero';
import ProjectDetail from './components/ProjectDetail';
import Preloader from './components/Preloader';

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutQuart
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    window.lenis = lenis;

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  // Smooth page transition handler for selecting projects
  const navigateToProject = React.useCallback((project) => {
    setIsTransitioning(true);
    if (window.lenis) window.lenis.stop();

    // After 400ms (screen goes white), swap project content and scroll to top
    setTimeout(() => {
      setSelectedProject(project);

      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      // Very quick buffer before fading out
      setTimeout(() => {
        setIsTransitioning(false);
        if (window.lenis) window.lenis.start();
      }, 150);
    }, 400);
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 selection:bg-black selection:text-white overflow-x-clip font-sans">
      
      {/* Preloader Screen */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      {/* 3D Canvas Background Layer - fixed position */}
      <div className="fixed inset-0 z-0">
        <ThreeHero onSelectProject={navigateToProject} selectedProject={selectedProject} />
      </div>

      {/* Page Transition Overlay (Minimal clean dip-to-white shutter) */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="page-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.25 }
            }}
            className="fixed inset-0 bg-white z-50 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Main Sections Overlay - flows naturally in window scroll */}
      <main className="relative z-10 w-full min-h-screen pointer-events-none">
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onBack={() => navigateToProject(null)} 
            onSelectProject={navigateToProject}
          />
        )}
      </main>

    </div>
  );
}
