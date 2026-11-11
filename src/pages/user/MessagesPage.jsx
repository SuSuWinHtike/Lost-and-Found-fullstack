import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Search,
  CheckCheck,
  PawPrint,
  ExternalLink,
  Info
} from 'lucide-react';

const MessagesPage = () => {
  const { conversations, sendMessage, pets, setSelectedPetForModal } = useApp();
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || 'c1');
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const relatedPet = pets.find(p => p.id === activeConv?.relatedPetId) || pets[1];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConv.id, inputText);
    setInputText('');
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.relatedPetName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Direct Inquiries
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Messages & Communication
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Chat directly with finders, owners, and community volunteers to coordinate pet returns.
        </p>
      </div>

      {/* Messenger Container */}
      <div className="bg-white rounded-3xl border border-amber-200/90 shadow-sm pet-shadow overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[620px]">
        
        {/* Left: Conversation List */}
        <div className="border-r border-stone-200 flex flex-col bg-stone-50/50">
          
          {/* Search conversation */}
          <div className="p-4 border-b border-stone-200">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredConversations.map(conv => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                    isSelected ? 'bg-amber-100/70 border-l-4 border-amber-500' : 'hover:bg-stone-100'
                  }`}
                >
                  <img
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {conv.participantName}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {conv.lastTimestamp}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">
                      {conv.lastMessage}
                    </p>
                    <span className="text-[10px] text-amber-800 font-semibold truncate block mt-0.5">
                      🐾 {conv.relatedPetName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Active Chat Area */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-between bg-white">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-3">
              <img
                src={activeConv?.participantAvatar}
                alt={activeConv?.participantName}
                className="w-10 h-10 rounded-full object-cover border border-amber-300"
              />
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  {activeConv?.participantName}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online Community Member
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:+959798123456"
                className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-amber-700 hover:bg-amber-50 transition"
                title="Direct Phone Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Pinned Related Pet Information Card */}
          {relatedPet && (
            <div className="p-3 mx-4 mt-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={relatedPet.images[0]}
                  alt={relatedPet.petName}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-300 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-stone-900 truncate">{relatedPet.petName}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                      {relatedPet.reportType}
                    </span>
                  </div>
                  <span className="text-stone-500 text-[11px] truncate block">
                    {relatedPet.breed} • {relatedPet.township}, {relatedPet.city}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPetForModal(relatedPet)}
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 flex-shrink-0"
              >
                <span>Report Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Flow */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="text-center my-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                Encrypted Peer-to-Peer Chat
              </span>
            </div>

            {activeConv?.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.isMe
                      ? 'bg-amber-500 text-white rounded-br-none shadow-sm'
                      : 'bg-stone-100 text-stone-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 px-1">
                  <span>{msg.timestamp}</span>
                  {msg.isMe && <CheckCheck className="w-3 h-3 text-amber-600" />}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50/40 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message to coordinate pet location..."
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default MessagesPage;
