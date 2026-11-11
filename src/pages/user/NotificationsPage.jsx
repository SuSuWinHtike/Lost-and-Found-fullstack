import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Check,
  CheckCheck,
  GitCompare,
  MessageSquare,
  FileCheck,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState('all'); // all, unread, match, message
  const navigate = useNavigate();

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'match') return n.type === 'match';
    if (filter === 'message') return n.type === 'message';
    return true;
  });

  const getIcon = (type) => {
    if (type === 'match') return <GitCompare className="w-5 h-5 text-amber-600" />;
    if (type === 'message') return <MessageSquare className="w-5 h-5 text-blue-600" />;
    if (type === 'status') return <FileCheck className="w-5 h-5 text-emerald-600" />;
    return <Bell className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
            Activity Alerts
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time updates regarding your pet reports, inquiries, and automated match alerts.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'unread', 'match', 'message'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              filter === f
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {f === 'all' && 'All Alerts'}
            {f === 'unread' && 'Unread Only'}
            {f === 'match' && 'Matches'}
            {f === 'message' && 'Messages'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                notif.read
                  ? 'bg-white border-stone-200 hover:border-amber-300'
                  : 'bg-amber-50/70 border-amber-200 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm flex-shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-extrabold text-stone-900 truncate">
                    {notif.title}
                  </h3>
                  <span className="text-[11px] text-stone-400 flex-shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {notif.message}
                </p>
                {notif.link && (
                  <span className="inline-block text-[11px] font-bold text-amber-700 hover:underline mt-2">
                    Open related page →
                  </span>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" title="Unread" />
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200 text-stone-500 text-xs">
            No notifications in this filter category.
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
