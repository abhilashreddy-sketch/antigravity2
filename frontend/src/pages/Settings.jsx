import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState(true);
  const [geminiKey, setGeminiKey] = useState('••••••••••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure API integrations, UI themes, and notification profiles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Menu Navigation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40 md:col-span-1 space-y-1 h-fit">
          <button className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-accent-600 bg-accent-50/50 dark:bg-accent-950/20 dark:text-accent-400">
            <Sliders size={15} /> General Settings
          </button>
          <button className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-850/50 dark:hover:text-slate-250">
            <Shield size={15} /> Security & APIs
          </button>
          <button className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-850/50 dark:hover:text-slate-250">
            <Bell size={15} /> Email Alerts
          </button>
        </div>

        {/* Configurations Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40 md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Visual Customization */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Sliders size={14} className="text-accent-500" /> UI Customization
              </h3>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div>
                  <h4 className="text-slate-800 dark:text-slate-250">Dark Mode Interface</h4>
                  <p className="text-[10px] text-slate-400">Toggle dark theme layout dynamically</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${theme === 'dark' ? 'bg-accent-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* AI Integrations */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Shield size={14} className="text-indigo-500" /> AI API Key Configuration
              </h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gemini API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter GEMINI_API_KEY..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 dark:border-slate-800 dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-all"
                  >
                    {showKey ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">
                  If left blank, ConstructAI falls back to the local analytics heuristics engine. Adding a Gemini key enables smart risks tagging and conversational audit logs.
                </p>
              </div>
            </div>

            {/* Email Alerts */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Bell size={14} className="text-emerald-500" /> Notifications & Logs
              </h3>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div>
                  <h4 className="text-slate-800 dark:text-slate-250">Risk Warning Email Alerts</h4>
                  <p className="text-[10px] text-slate-400">Trigger email notifications to PMs when site delays are flagged</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifications ? 'bg-accent-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-700 shadow-lg shadow-accent-600/15 transition-all"
              >
                Save Settings
              </button>
              {saved && (
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <Check size={14} /> Settings applied successfully.
                </span>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
