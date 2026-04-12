import { useEffect, useState } from 'react';
import AppSidebar from '../AppSidebar/AppSidebar';
import AppHeader from '../AppHeader/AppHeader';
import './AppShell.css';

function AppShell({ title, children, pageClassName = '' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className={`app-shell-page ${pageClassName}`.trim()}>
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="app-shell-main">
        <AppHeader
          title={title}
          onMenuClick={() => setIsSidebarOpen(true)}
          showMenuButton
        />

        <section className="app-shell-content">{children}</section>
      </main>

      {isSidebarOpen && (
        <button
          type="button"
          className="app-shell-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar menu lateral"
        />
      )}
    </div>
  );
}

export default AppShell;