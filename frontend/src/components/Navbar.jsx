import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'top-2' : 'top-4'
      }`}
    >
      <div
        className={`glass rounded-full px-6 py-3 flex items-center gap-8 transition-all duration-300 ${
          isScrolled ? 'shadow-2xl bg-white/15' : 'shadow-lg'
        }`}
      >
        {/* Logo */}
        <div onClick={handleLogoClick} className="cursor-pointer mr-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">
              PlanMorph Tech
            </span>
          </motion.div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
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
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <Link to="/quote">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get a Quote
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
