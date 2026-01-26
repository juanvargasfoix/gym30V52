import React, { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { AdminPanel } from './components/AdminPanel';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { Onboarding } from './components/Onboarding';
import { CompetenceMap } from './components/CompetenceMap';
import { initializeDefaultData } from './utils/data';
import { User } from './types';
import { getCurrentSession, logoutUser } from './src/lib/supabase-auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Initialize Default Data (Mock DB)
        initializeDefaultData();

        // 2. Check for Session in Supabase
        const supabaseUser = await getCurrentSession();

        if (supabaseUser) {
          setCurrentUser(supabaseUser as unknown as User);
        } else {
          // Fallback: Check for Session in localStorage
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('❌ Error inicializando app:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (user: User) => {
    try {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('❌ Error en login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  };

  const handleOnboardingComplete = () => {
    try {
      // Reload user from storage to get updated XP and flags
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updated = allUsers.find((u: User) => u.username === currentUser?.username);
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem('currentUser', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('❌ Error completando onboarding:', error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;

  // ROUTING LOGIC
  const renderScreen = () => {
    if (!currentUser) {
      return <Landing onLogin={handleLogin} />;
    }

    if (currentUser.role === 'admin') {
      return <AdminPanel currentUser={currentUser} onLogout={handleLogout} />;
    }

    if (currentUser.role === 'supervisor') {
      return <SupervisorDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }

    if (currentUser.role === 'participante') {
      if (!currentUser.onboardingCompleted) {
        return <Onboarding currentUser={currentUser} onComplete={handleOnboardingComplete} />;
      }
      return <CompetenceMap currentUser={currentUser} onLogout={handleLogout} />;
    }

    return <div>Role not recognized</div>;
  };

  return renderScreen();
};

export default App;