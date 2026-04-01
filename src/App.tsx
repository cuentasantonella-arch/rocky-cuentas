import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard, AccountsPage, AddAccountPage, ImportPage } from './components/Pages';
import { ProductManager, ProviderManager, ClientManager } from './components/Modals';
import { SettingsPanel } from './components/Settings';
import { Login } from './components/Login';
import { ActivityLog } from './components/ActivityLog';
import { Instructivos } from './components/Instructivos';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

type Page = 'dashboard' | 'accounts' | 'add' | 'import' | 'products' | 'providers' | 'clients' | 'settings' | 'activity' | 'instructivos';

function App() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    const handleNavigate = (e: CustomEvent<Page>) => {
      setCurrentPage(e.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <AccountsPage />;
      case 'add':
        return <AddAccountPage />;
      case 'import':
        return <ImportPage />;
      case 'products':
        return <ProductManager />;
      case 'providers':
        return <ProviderManager />;
      case 'clients':
        return <ClientManager />;
      case 'settings':
        return <SettingsPanel />;
      case 'activity':
        return <ActivityLog />;
      case 'instructivos':
        return <Instructivos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
