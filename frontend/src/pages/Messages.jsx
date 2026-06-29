import React, { useState } from 'react';
import { Send, User, ShieldAlert, Sparkles, MessageSquare, Plus, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_CHANNELS = [
  { id: 'general', name: 'General Announcements', unread: 2 },
  { id: 'safety', name: 'Safety & Site Compliance', unread: 0 },
  { id: 'downtown-tower', name: 'Downtown Tower Project', unread: 1 },
  { id: 'logistics', name: 'Materials & Procurement Log', unread: 0 },
];

const INITIAL_MESSAGES = {
  general: [
    { id: 1, sender: 'Abhilash Admin', role: 'admin', text: 'Welcome to the ConstructAI Control Console message boards. Use this space to post site remarks, coordination updates, and compliance notes.', time: '10:15 AM' },
    { id: 2, sender: 'Sarah Manager', role: 'manager', text: 'All engineers, please make sure to log your Daily Progress Reports before 5:00 PM local time.', time: '11:04 AM' },
  ],
  safety: [
    { id: 1, sender: 'John Engineer', role: 'engineer', text: 'Heavy wind warning resolved for Tower A. Cranes are back in operation as of 1:30 PM.', time: '2:15 PM' },
  ],
  'downtown-tower': [
    { id: 1, sender: 'Sarah Manager', role: 'manager', text: 'John, did we receive the new steel bars delivery at the downtown site today?', time: 'Yesterday' },
    { id: 2, sender: 'John Engineer', role: 'engineer', text: 'Yes Sarah. Checked, counted, and stored. Inventory has been updated in the materials sheet.', time: 'Yesterday' },
  ],
  logistics: [
    { id: 1, sender: 'Abhilash Admin', role: 'admin', text: 'Cement stock alert generated: Tower A framing levels fell below 10 bags. Order dispatched.', time: '9:00 AM' },
  ],
};

const Messages = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: user.name,
      role: user.role,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setInputText('');
    
    // Clear unread badge
    setChannels(prev => prev.map(c => c.id === activeChannelId ? { ...c, unread: 0 } : c));
  };

  const selectChannel = (id) => {
    setActiveChannelId(id);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'manager': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Collaboration Board
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Coordinate operations, flag safety concerns, and text engineering colleagues in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[65vh]">
        {/* Sidebar: Channel List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40 md:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>Discussion Channels</span>
              <button className="hover:text-slate-655 text-slate-400"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {channels.map(channel => {
                const isActive = channel.id === activeChannelId;
                return (
                  <button
                    key={channel.id}
                    onClick={() => selectChannel(channel.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                      isActive 
                        ? 'bg-accent-600 text-white shadow-premium' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-850 dark:text-slate-400 dark:hover:bg-slate-850/50 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare size={14} />
                      {channel.name}
                    </span>
                    {channel.unread > 0 && !isActive && (
                      <span className="h-4 px-1.5 min-w-4 flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                        {channel.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center gap-2 text-xs text-slate-400">
            <Bell size={14} />
            <span>Operational Alert Channel Active</span>
          </div>
        </div>

        {/* Message View Area */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 md:col-span-3 flex flex-col justify-between overflow-hidden">
          {/* Active channel header */}
          <div className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-950/20 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100"># {activeChannel?.name}</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-400">Collaboration feed for team coordination</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-950/45 dark:text-indigo-400">
              <Sparkles size={10} /> Active Team Board
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {messages[activeChannelId]?.map(msg => (
              <div key={msg.id} className="flex gap-3.5 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-650 dark:bg-slate-800 dark:text-slate-305">
                  {msg.sender.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{msg.sender}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${getRoleColor(msg.role)}`}>
                      {msg.role}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 dark:bg-slate-950/20 max-w-xl">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form message input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-100 dark:border-slate-800 p-4 flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChannel?.name}...`}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 dark:border-slate-800 dark:bg-slate-900"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white hover:bg-accent-700 shadow-lg shadow-accent-600/15 transition-all"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
