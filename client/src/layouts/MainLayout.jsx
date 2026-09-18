import React, { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { LogOut, Plus } from 'lucide-react';
import clsx from 'clsx';
import TransactionModal from '../components/TransactionModal';
import MagneticButton from '../components/MagneticButton';
import { useRefresh } from '../context/RefreshContext';

export const MainLayout = () => {
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { triggerRefresh } = useRefresh();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream text-ink font-serif">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/app' },
    { name: 'Transactions', path: '/app/transactions' },
    { name: 'Analytics', path: '/app/analytics' },
    { name: 'Income', path: '/app/income' },
    { name: 'Settings', path: '/app/settings' },
  ];

  return (
    <div className="min-h-screen bg-cream text-ink font-sans selection:bg-yellow selection:text-ink flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-cream-secondary flex-col hidden md:flex fixed h-full bg-cream z-30">
        <div className="p-8 pb-12">
          <span className="font-serif text-2xl tracking-tight">Sundae</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                clsx(
                  'block px-4 py-3 text-sm font-medium transition-colors rounded-sm tracking-wide interactive',
                  isActive
                    ? 'text-ink bg-cream-secondary'
                    : 'text-olive hover:text-ink hover:bg-cream-secondary/50'
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-8 space-y-6">
          <MagneticButton
            isCta
            onClick={() => setIsTransactionModalOpen(true)}
            className="flex items-center w-full px-4 py-4 text-sm font-medium text-ink bg-yellow hover:bg-[#d6c449] transition-colors rounded-sm tracking-wide justify-center group space-x-2"
          >
            <span>Add entry</span>
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </MagneticButton>

          <button
            onClick={() => dispatch(logoutUser())}
            className="flex items-center w-full text-sm font-medium text-olive hover:text-ink transition-colors interactive"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden relative z-10">
        {/* Mobile Header */}
        <header className="h-20 border-b border-cream-secondary flex items-center justify-between px-6 md:hidden bg-cream sticky top-0 z-40">
          <span className="font-serif text-xl tracking-tight">Sundae</span>
          <button
             onClick={() => setIsTransactionModalOpen(true)}
             className="w-10 h-10 rounded-full bg-yellow text-ink flex items-center justify-center hover:bg-[#d6c449] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 w-full p-6 pb-32 md:p-12 md:pb-12">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full bg-cream border-t border-cream-secondary flex justify-between px-2 pb-safe z-40 h-16 items-center">
           {navItems.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               end={item.path === '/app'}
               className={({ isActive }) =>
                 clsx(
                   'flex-1 text-center py-2 text-[10px] uppercase tracking-widest font-medium transition-colors',
                   isActive ? 'text-ink' : 'text-olive'
                 )
               }
             >
               {item.name}
             </NavLink>
           ))}
        </nav>
      </main>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)}
        onSaved={() => {
          setIsTransactionModalOpen(false);
          triggerRefresh();
        }}
      />
    </div>
  );
};
