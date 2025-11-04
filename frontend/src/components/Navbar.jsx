import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show bottom nav when scrolling down, hide when scrolling up or at top
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowBottomNav(true);
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowBottomNav(false);
        setIsScrolled(currentScrollY > 20);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    clickCount.current += 1;

    // Clear existing timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    // If triple-clicked, navigate to admin
    if (clickCount.current === 3) {
      clickCount.current = 0;
      navigate('/admin/login');
      return;
    }

    // Reset counter after 500ms of no clicks
    clickTimer.current = setTimeout(() => {
      if (clickCount.current < 3) {
        // Single or double click - just navigate home
        navigate('/');
      }
      clickCount.current = 0;
    }, 500);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navbar - Hides when scrolling down */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: showBottomNav ? -100 : 0, 
          opacity: showBottomNav ? 0 : 1 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-7xl ${
          isScrolled ? 'top-2' : 'top-4'
        }`}
      >
        <div
          className={`glass rounded-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'shadow-2xl bg-white/15' : 'shadow-lg'
          }`}
        >
          {/* Logo */}
          <div onClick={handleLogoClick} className="cursor-pointer flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-white font-bold text-base sm:text-lg">
                PlanMorph Tech
              </span>
            </motion.div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </motion.span>
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator-top"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/quote" className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              >
                Get a Quote
              </motion.button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Bottom Floating Navbar - Shows when scrolling down */}
      <AnimatePresence>
        {showBottomNav && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto"
          >
            <div className="glass-dark rounded-full px-6 py-3 flex items-center justify-center gap-6 shadow-2xl border-2 border-white/20">
              {/* Quick Nav Icons */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      isActive(link.path) ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {/* Icon based on link */}
                    {link.name === 'Home' && (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                    {link.name === 'Services' && (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {link.name === 'Pricing' && (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="navbar-indicator-bottom"
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/50"
                        initial={false}
                      />
                    )}
                  </motion.div>
                </Link>
              ))}

              {/* Divider */}
              <div className="w-px h-8 bg-white/20"></div>

              {/* Quote Button */}
              <Link to="/quote">
                <motion.button
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                  aria-label="Get a quote"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
              </Link>

              {/* Divider */}
              <div className="w-px h-8 bg-white/20"></div>

              {/* Scroll to Top Button */}
              <motion.button
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                aria-label="Scroll to top"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] glass-dark z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={handleNavClick}
                        className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                          isActive(link.path)
                            ? 'bg-white/20 text-white'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <div className="mt-auto">
                  <Link to="/quote" onClick={handleNavClick}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg"
                    >
                      Get a Quote
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
