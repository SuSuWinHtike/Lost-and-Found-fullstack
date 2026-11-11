import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import messageService from '../../services/messageService';
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Search,
  CheckCheck,
  PawPrint,
  ExternalLink,
  Info,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

const MessagesPage = () => {
  const { conversations, sendMessage, pets, setSelectedPetForModal, currentUser } = useApp();
  const [searchParams] = useSearchParams();
  const [dbConversations, setDbConversations] = useState(null);
  const [activeConvId, setActiveConvId] = useState(() => {
    const paramId = searchParams.get('convId');
    if (paramId && !isNaN(Number(paramId))) return Number(paramId);
    return conversations[0]?.id || 'c1';
  });
  const [activeMessages, setActiveMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const convIdParam = searchParams.get('convId');
  const ownerIdParam = searchParams.get('ownerId');
  const petIdParam = searchParams.get('petId');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch real conversations from MySQL
  const loadConversations = () => {
    messageService.getConversations()
      .then(list => {
        if (list && list.length > 0) {
          const formatted = list.map(c => ({
            id: c.id,
            participantName: c.other_user?.name || 'Pet Owner',
            participantPhone: c.other_user?.phone || '09-450-123-789',
            participantAvatar: c.other_user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            relatedPetId: c.pet_report?.id,
            relatedPetName: c.pet_report?.pet_name || 'Pet Inquest',
            relatedPetImage: c.pet_report?.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
            lastMessage: c.last_message?.message_text || 'Conversation opened',
            lastTimestamp: 'Recent',
            unreadCount: c.unread_count || 0,
            messages: []
          }));
          setDbConversations(formatted);
          if (convIdParam && !isNaN(Number(convIdParam))) {
            setActiveConvId(Number(convIdParam));
          } else if (formatted[0] && !convIdParam) {
            setActiveConvId(formatted[0].id);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadConversations();
  }, [convIdParam]);

  // 2. Handle incoming deep-link conversation with owner
  useEffect(() => {
    if (ownerIdParam && !convIdParam) {
      const targetOwner = Number(ownerIdParam);
      const targetPet = petIdParam ? Number(petIdParam) : null;
      if (!isNaN(targetOwner) && targetOwner !== currentUser?.id) {
        messageService.startConversation(targetOwner, targetPet)
          .then(res => {
            if (res.conversation_id) {
              setActiveConvId(res.conversation_id);
              loadConversations();
            }
          })
          .catch(() => {});
      }
    }
  }, [ownerIdParam, petIdParam, currentUser]);

  // 3. Fetch messages for active conversation from MySQL
  useEffect(() => {
    if (typeof activeConvId === 'number') {
      setLoadingMessages(true);
      messageService.getMessages(activeConvId)
        .then(res => {
          if (res.data) {
            setActiveMessages(res.data.map(m => ({
              id: m.id,
              senderId: m.sender_id,
              senderName: m.sender_id === currentUser?.id ? 'Me' : 'Participant',
              text: m.message_text,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: m.sender_id === currentUser?.id,
            })));
            setTimeout(scrollToBottom, 100);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingMessages(false));

      // Real-time polling every 3.5s
      const pollTimer = setInterval(() => {
        messageService.getMessages(activeConvId)
          .then(res => {
            if (res.data) {
              setActiveMessages(res.data.map(m => ({
                id: m.id,
                senderId: m.sender_id,
                senderName: m.sender_id === currentUser?.id ? 'Me' : 'Participant',
                text: m.message_text,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: m.sender_id === currentUser?.id,
              })));
            }
          })
          .catch(() => {});
      }, 3500);

      return () => clearInterval(pollTimer);
    }
  }, [activeConvId, currentUser]);

  const convList = dbConversations || conversations || [];
  const activeConv = convList.find(c => c.id === activeConvId) || convList[0];
  const relatedPet = pets.find(p => p.id === activeConv?.relatedPetId) || pets[1];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    const textToSend = inputText;
    setInputText('');

    if (typeof activeConv.id === 'number') {
      try {
        const msg = await messageService.sendMessage(activeConv.id, textToSend);
        setActiveMessages(prev => [...prev, {
          id: msg.id,
          senderId: msg.sender_id,
          senderName: 'Me',
          text: msg.message_text,
          timestamp: 'Just now',
          isMe: true,
        }]);
        setTimeout(scrollToBottom, 50);

        // Update last message in conversation list
        setDbConversations(prev => {
          if (!prev) return prev;
          return prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: textToSend, lastTimestamp: 'Just now' } : c);
        });
        return;
      } catch {
        // Fallback to local
      }
    }

    sendMessage(activeConv.id, textToSend);
    setTimeout(scrollToBottom, 50);
  };

  const filteredConversations = (convList || []).filter(c =>
    (c.participantName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.relatedPetName || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const displayedMessages = (typeof activeConvId === 'number' && activeMessages.length > 0)
    ? activeMessages
    : (activeConv?.messages || []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Direct Inquiries & Sighting Chat
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          Messages & Communication
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Coordinate street sightings, discuss lost & found reports, and arrange reunions in real time.
        </p>
      </div>

      {/* Messenger Container */}
      <div className="bg-white rounded-3xl border border-amber-200/90 shadow-sm pet-shadow overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[640px]">
        
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
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
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
                      {conv.relatedPetName && (
                        <span className="text-[10px] text-amber-800 font-semibold truncate block mt-0.5">
                          🐾 {conv.relatedPetName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">
                No active conversations yet.
              </div>
            )}
          </div>

        </div>

        {/* Right: Active Chat Area */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-between bg-white">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-3">
              <img
                src={activeConv?.participantAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={activeConv?.participantName}
                className="w-10 h-10 rounded-full object-cover border border-amber-300"
              />
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">
                  {activeConv?.participantName || 'Pet Inquest'}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Pet Community Chat
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeConv?.participantPhone || '09450123789'}`}
                className="py-1.5 px-3 rounded-xl border border-stone-200 text-stone-700 hover:text-amber-700 hover:bg-amber-50 text-xs font-bold transition flex items-center gap-1.5"
                title="Direct Phone Call"
              >
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>Call {activeConv?.participantPhone || 'Phone'}</span>
              </a>
            </div>
          </div>

          {/* Pinned Related Pet Information Card */}
          {relatedPet && (
            <div className="p-3 mx-4 mt-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={relatedPet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
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
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                <span>Report Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Flow */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px]">
            <div className="text-center my-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                Real-Time Pet Community Discussion
              </span>
            </div>

            {displayedMessages.map(msg => {
              const isSightingAlert = msg.text && msg.text.startsWith('📍 Community Sighting');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  {isSightingAlert ? (
                    <div className="max-w-md p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Verified Street Sighting Report</span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">
                        {msg.text.replace('📍 Community Sighting: ', '')}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.isMe
                          ? 'bg-amber-500 text-white rounded-br-none shadow-sm'
                          : 'bg-stone-100 text-stone-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 px-1">
                    <span>{msg.timestamp}</span>
                    {msg.isMe && <CheckCheck className="w-3 h-3 text-amber-600" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50/40 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message to coordinate location, ask details, or arrange meetup..."
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            <button
              type="submit"
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-500/20 cursor-pointer"
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
