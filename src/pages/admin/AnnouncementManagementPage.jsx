import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  Eye
} from 'lucide-react';

const AnnouncementManagementPage = () => {
  const { announcements, addAnnouncement, deleteAnnouncement } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Public Welfare');
  const [priority, setPriority] = useState('Normal');
  const [target, setTarget] = useState('All Users');
  const [content, setContent] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title,
      category,
      priority,
      target,
      content
    });

    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Broadcast Communications
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Announcement Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Publish system-wide alerts, free veterinary campaigns, and community safety guidelines to pet parents.
        </p>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" />
          Create Community Announcement
        </h3>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Rabies Vaccination Camp - Kamayut Township..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-800 bg-white"
              >
                <option value="Public Welfare">Public Welfare</option>
                <option value="Safety Alert">Safety Alert</option>
                <option value="System">System Notice</option>
                <option value="Community Event">Community Event</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Content Details *</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide complete guidelines, dates, locations, or advisory instructions..."
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Publish Announcement
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-stone-900">
          Published Announcements ({announcements.length})
        </h3>

        <div className="space-y-3">
          {announcements.map(item => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    {item.category}
                  </span>
                  <span className="text-xs text-stone-400">• {item.date}</span>
                </div>
                <h4 className="font-extrabold text-sm text-stone-900">{item.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{item.content}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => deleteAnnouncement(item.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition border border-stone-200"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnnouncementManagementPage;
