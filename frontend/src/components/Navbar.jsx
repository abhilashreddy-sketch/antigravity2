import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  CheckCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import axios from 'axios';

const Navbar = ({ theme, toggleTheme, sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'delay':
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={16} />;
      default:
        return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sticky top-0 z-30">
      
      {/* Left Area: Hamburger and Page title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
          Workspace / Active Project Dashboard
        </span>
      </div>

      {/* Right Area: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Dark/Light Mode toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all ${showDropdown && 'bg-slate-100 dark:bg-slate-800'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <>
              {/* Back backdrop to close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              />
              
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h5>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline dark:text-accent-400"
                    >
                      <CheckCheck size={14} /> Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto py-2">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">No alerts or notifications.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id);
                        }}
                        className={`flex gap-3 rounded-xl p-3 text-left transition-colors cursor-pointer ${notif.read ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'}`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow dark:bg-slate-800">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-accent-500"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 block pt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-9 w-9 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold">
            {user?.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">
            {user?.name}
          </span>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
