import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../public.css';

export default function PublicLayout() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="public-shell bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-dvh font-sans antialiased flex flex-col transition-colors duration-300">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="public-main flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

