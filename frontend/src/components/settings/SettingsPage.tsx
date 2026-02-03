// =============================================================================
// PhotoEnglish - Settings Page
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Target,
  Bell,
  Moon,
  Sun,
  Info,
  ChevronRight,
  Camera,
  Check,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  X,
  ArrowLeft,
} from 'lucide-react';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');

  // Learning preferences states
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [englishLevel, setEnglishLevel] = useState(user?.englishLevel || 'beginner');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || '20');

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('dark_mode', newMode.toString());
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSuccess('请选择图片文件');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSuccess('图片大小不能超过 5MB');
      return;
    }

    setIsSaving(true);
    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Call API to update avatar
        await userApi.updateProfile({ avatar_url: base64String });
        await refreshUser();
        showSuccess('头像已更新');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showSuccess('头像上传失败，请重试');
    } finally {
      setIsSaving(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle notifications toggle
  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('notifications_enabled', newState.toString());

    if (newState) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            showSuccess('学习提醒已开启');
            new Notification('PhotoEnglish', {
              body: '学习提醒已开启！',
              icon: '/icon-192.png',
            });
          }
        });
      } else {
        showSuccess('学习提醒已开启');
      }
    } else {
      showSuccess('学习提醒已关闭');
    }
  };

  // Handle version info click
  const handleVersionInfoClick = () => {
    setShowVersionInfo(!showVersionInfo);
  };

  // Check initial settings
  useEffect(() => {
    const isDark = localStorage.getItem('dark_mode') === 'true';
    setIsDarkMode(isDark);
    const notifications = localStorage.getItem('notifications_enabled') === 'true';
    setNotificationsEnabled(notifications);
  }, []);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await userApi.updateProfile({ nickname: nickname.trim() });
      await refreshUser();
      setIsEditingProfile(false);
      showSuccess('个人资料已更新');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showSuccess('更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // Save preferences changes
  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await userApi.updatePreferences({
        englishLevel: englishLevel as 'beginner' | 'intermediate' | 'advanced',
        dailyGoal: dailyGoal as '10' | '20' | '30' | '50',
      });
      await refreshUser();
      setIsEditingPreferences(false);
      showSuccess('学习偏好已更新');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      showSuccess('更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Handle password change
  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleSubmitPasswordChange = async () => {
    setPasswordError('');

    // Validation
    if (!currentPassword) {
      setPasswordError('请输入当前密码');
      return;
    }

    if (!newPassword) {
      setPasswordError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('新密码至少需要 6 个字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('新密码不能与当前密码相同');
      return;
    }

    setIsSaving(true);
    try {
      // Call API to change password
      const response = await userApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        setPasswordError(response.error || '密码修改失败');
        return;
      }

      showSuccess('密码已成功修改');
      handleClosePasswordModal();
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError(error instanceof Error ? error.message : '密码修改失败，请检查当前密码是否正确');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Hidden file input for avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            设置
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-24">

        {/* Success Message */}
        {saveMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              {saveMessage}
            </span>
          </div>
        )}

        {/* Account Information Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
            账户信息
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Avatar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{(user.nickname || user.username)[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    头像
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {isSaving ? '上传中...' : '点击更换头像'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isSaving}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    邮箱
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      手机号
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {user.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nickname - Editable */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="输入昵称"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div className="flex gap-2 pl-8">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || !nickname.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setNickname(user.nickname);
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        昵称
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {user.nickname}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </button>
              )}
            </div>

            {/* Change Password */}
            <div className="p-4">
              <button
                onClick={handleChangePassword}
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      修改密码
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      更改您的登录密码
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              </button>
            </div>
          </div>
        </section>

        {/* Learning Preferences Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
            学习偏好
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {isEditingPreferences ? (
              <div className="p-4 space-y-4">
                {/* English Level */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    英语水平
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'beginner', label: '初级' },
                      { value: 'intermediate', label: '中级' },
                      { value: 'advanced', label: '高级' },
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setEnglishLevel(level.value as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          englishLevel === level.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Goal */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    每日目标
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['10', '20', '30', '50'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setDailyGoal(goal as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dailyGoal === goal
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {goal}词
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {isSaving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPreferences(false);
                      setEnglishLevel(user.englishLevel);
                      setDailyGoal(user.dailyGoal);
                    }}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingPreferences(true)}
                className="flex items-center justify-between w-full p-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      学习偏好
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {user.englishLevel === 'beginner' ? '初级' : user.englishLevel === 'intermediate' ? '中级' : '高级'} · {user.dailyGoal}词/天
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              </button>
            )}
          </div>
        </section>

        {/* App Settings Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
            应用设置
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  {isDarkMode ? <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    深色模式
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {isDarkMode ? '已开启' : '已关闭'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isDarkMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    学习提醒
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {notificationsEnabled ? '已开启' : '已关闭'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    notificationsEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
            关于
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={handleVersionInfoClick}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    版本信息
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    PhotoEnglish v1.0.0
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showVersionInfo ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded version info */}
            {showVersionInfo && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
                <div className="pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      版本号
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      v1.0.0
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      构建时间
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      2026-01-31
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      React
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      v19.2.0
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Tailwind CSS
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      v4.1.17
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    新功能
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>自定义标签功能</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>练习配置选项</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>深色模式支持</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <span>头像上传功能</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    这是开发版本，部分功能使用 Mock API 数据。正式版本即将推出！
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                修改密码
              </h2>
              <button
                onClick={handleClosePasswordModal}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Error Message */}
              {passwordError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {passwordError}
                  </p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  当前密码
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="输入当前密码"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  新密码
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入新密码（至少 6 个字符）"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  密码至少需要 6 个字符
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  确认新密码
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="text-slate-600 dark:text-slate-400">密码强度</span>
                    <span className={`font-medium ${
                      newPassword.length < 6
                        ? 'text-red-600 dark:text-red-400'
                        : newPassword.length < 10
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {newPassword.length < 6 ? '弱' : newPassword.length < 10 ? '中等' : '强'}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        newPassword.length < 6
                          ? 'w-1/3 bg-red-500'
                          : newPassword.length < 10
                          ? 'w-2/3 bg-amber-500'
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
              <button
                onClick={handleClosePasswordModal}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                取消
              </button>
              <button
                onClick={handleSubmitPasswordChange}
                disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSaving ? '提交中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
