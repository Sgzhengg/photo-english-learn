// =============================================================================
// PhotoEnglish - App Shell (Navigation Wrapper)
// =============================================================================

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell as AppShellUI } from '@/shell/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle logout with navigation
  const handleLogout = async () => {
    await logout();
    // Navigate to login page after logout
    navigate('/login');
  };

  // Define navigation items
  const navigationItems = [
    {
      label: '拍照识别',
      href: '/app/photo-capture',
      isActive: location.pathname === '/app/photo-capture',
      icon: 'camera',
      isPrimary: true,
    },
    {
      label: '生词库',
      href: '/app/vocabulary',
      isActive: location.pathname === '/app/vocabulary',
      icon: 'book-open',
    },
    {
      label: '练习',
      href: '/app/practice',
      isActive: location.pathname === '/app/practice',
      icon: 'pen-line',
    },
    {
      label: '统计',
      href: '/app/progress',
      isActive: location.pathname === '/app/progress',
      icon: 'bar-chart-3',
    },
  ];

  const userData = user ? {
    name: user.nickname || user.username || 'User',
    avatarUrl: user.avatar_url,
  } : undefined;

  return (
    <AppShellUI
      navigationItems={navigationItems}
      user={userData}
      onNavigate={(href) => {
        // Navigate using React Router
        navigate(href);
      }}
      onLogout={handleLogout}
      onSettings={() => {
        navigate('/app/settings');
      }}
    >
      <Outlet />
    </AppShellUI>
  );
}
