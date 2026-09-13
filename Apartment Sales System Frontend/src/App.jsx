import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ApartmentsPage } from './pages/ApartmentsPage';
import { ApartmentDetailPage } from './pages/ApartmentDetailPage';
import { ExternalApartmentsPage } from './pages/ExternalApartmentsPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AuthPage } from './pages/AuthPage';
import { InternalLoginPage } from './pages/InternalLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

export function AppContent() {
  const [activePage, setActivePage] = useState(() => window.location.pathname === '/internal-login' ? 'internal-login' : 'home');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const internalDashboardPages = ['internal-dashboard', 'sales-dashboard', 'marketing-dashboard', 'customer-relations-dashboard', 'finance-dashboard', 'property-development-dashboard', 'operations-dashboard'];
  const internalPortal = activePage === 'internal-login' || activePage === 'admin-dashboard' || internalDashboardPages.includes(activePage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!internalPortal && <Navbar activePage={activePage} setActivePage={setActivePage} />}

      <main style={{ flex: 1 }}>
        {activePage === 'home' && (
          <HomePage 
            setActivePage={setActivePage} 
            setSelectedApartment={setSelectedApartment} 
          />
        )}
        {activePage === 'apartments' && (
          <ApartmentsPage 
            setActivePage={setActivePage} 
            setSelectedApartment={setSelectedApartment} 
            initialTab="complexes"
          />
        )}
        {activePage === 'units' && (
          <ApartmentsPage 
            setActivePage={setActivePage} 
            setSelectedApartment={setSelectedApartment} 
            initialTab="units"
          />
        )}
        {activePage === 'apartment-detail' && (
          <ApartmentDetailPage 
            apartment={selectedApartment} 
            onBack={() => setActivePage('apartments')} 
            setActivePage={setActivePage} 
          />
        )}
        {activePage === 'external' && <ExternalApartmentsPage />}
        {activePage === 'promotions' && <PromotionsPage />}
        {activePage === 'customer-dashboard' && <CustomerDashboard setActivePage={setActivePage} />}
        {activePage === 'staff-dashboard' && <StaffDashboard />}
        {activePage === 'auth' && <AuthPage setActivePage={setActivePage} />}
        {activePage === 'internal-login' && <InternalLoginPage setActivePage={setActivePage} />}
        {activePage === 'admin-dashboard' && <AdminDashboard setActivePage={setActivePage} />}
        {internalDashboardPages.includes(activePage) && <StaffDashboard />}
      </main>

      {!internalPortal && <Footer setActivePage={setActivePage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
}
