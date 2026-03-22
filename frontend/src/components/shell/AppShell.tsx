// =============================================================================
// PhotoEnglish - App Shell (Navigation Wrapper) - Anonymous User Mode
// =============================================================================

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell as AppShellUI } from '@/shell/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { resetDeviceId } from '@/lib/device-id';

export function AppShell() {
  const { user, anonymousLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle reset account (for anonymous users)
  const handleResetAccount = async () => {
    if (confirm('确定要重置账户吗？这将清除所有学习数据！')) {
      // Clear device ID
      resetDeviceId();
      // Re-login with new device ID
      await anonymousLogin();
      // Navigate to home
      navigate('/app/photo-capture');
    }
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
      onLogout={handleResetAccount}
      onSettings={() => {
        navigate('/app/settings');
      }}
    >
      <Outlet />
    </AppShellUI>
  );
}
