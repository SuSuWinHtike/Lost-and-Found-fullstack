import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import messageService from '../../services/messageService';
import Badge from '../../components/common/Badge';
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
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';

const MessagesPage = () => {
  const { pets = [], setSelectedPetForModal, currentUser, addToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [dbConversations, setDbConversations] = useState(null);
  const [activeConvId, setActiveConvId] = useState(() => {
    const paramId = searchParams.get('convId');
    return paramId ? Number(paramId) : null;
  });
  const [activeMessages, setActiveMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [recipientSelect, setRecipientSelect] = useState('');
  const [newChatPetSelect, setNewChatPetSelect] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');

  const messagesEndRef = useRef(null);

  const convIdParam = searchParams.get('convId');
  const ownerIdParam = searchParams.get('ownerId');
  const petIdParam = searchParams.get('petId');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch real conversations from MySQL
  const loadConversations = async () => {
    try {
      const list = await messageService.getConversations();
      if (Array.isArray(list)) {
        const formatted = list.map(c => {
          const petImg = c.pet_report?.images?.[0]?.image_path;
          const formattedPetImg = petImg
            ? (petImg.startsWith('/storage') ? 'http://127.0.0.1:8000' + petImg : petImg)
            : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';

          return {
            id: c.id,
            participantId: c.other_user?.id,
            participantName: c.other_user?.name || 'Pet Caretaker',
            participantPhone: c.other_user?.phone || '09-450-123-789',
            participantAvatar: c.other_user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            relatedPetId: c.pet_report?.id,
            relatedPetName: c.pet_report?.pet_name || 'Pet Discussion',
            relatedPetImage: formattedPetImg,
            petReport: c.pet_report,
            lastMessage: c.last_message?.message_text || 'Conversation initiated',
            lastTimestamp: c.last_message?.created_at
              ? new Date(c.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent',
            unreadCount: c.unread_count || 0,
          };
        });

        setDbConversations(formatted);

        // Auto-select active conversation
        if (convIdParam && !isNaN(Number(convIdParam))) {
          setActiveConvId(Number(convIdParam));
        } else if (formatted.length > 0) {
          setActiveConvId(prev => {
            if (prev && formatted.some(c => c.id === prev)) return prev;
            return formatted[0].id;
          });
        }
      } else {
        setDbConversations([]);
      }
    } catch (err) {
      console.error('Failed to load conversations from MySQL API:', err);
      setDbConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [convIdParam]);

  // 2. Handle deep-link: /user/messages?ownerId=...&petId=...
  useEffect(() => {
    if (ownerIdParam) {
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
          .catch(err => console.error('Start conversation error:', err));
      }
    }
  }, [ownerIdParam, petIdParam, currentUser]);

  // 3. Fetch messages for active conversation from MySQL + Real-time polling
  useEffect(() => {
    if (!activeConvId || typeof activeConvId !== 'number') {
      setActiveMessages([]);
      return;
    }

    setLoadingMessages(true);
    messageService.getMessages(activeConvId)
      .then(res => {
        if (res && res.data) {
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
      .catch(err => console.error('Fetch messages error:', err))
      .finally(() => setLoadingMessages(false));

    // Live polling every 3 seconds for new messages
    const pollInterval = setInterval(() => {
      messageService.getMessages(activeConvId)
        .then(res => {
          if (res && res.data) {
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
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeConvId, currentUser]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const msg = await messageService.sendMessage(activeConv.id, textToSend);
      setActiveMessages(prev => [...prev, {
        id: msg.id || Date.now(),
        senderId: msg.sender_id || currentUser?.id,
        senderName: 'Me',
        text: msg.message_text || textToSend,
        timestamp: 'Just now',
        isMe: true,
      }]);
      setTimeout(scrollToBottom, 50);

      // Update conversation item preview in sidebar
      setDbConversations(prev => {
        if (!prev) return prev;
        return prev.map(c => c.id === activeConv.id
          ? { ...c, lastMessage: textToSend, lastTimestamp: 'Just now' }
          : c
        );
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      if (addToast) addToast('Failed to deliver message. Please check connection.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Start new conversation manually
  const handleStartNewChat = async (e) => {
    e.preventDefault();
    if (!recipientSelect) return;

    try {
      const res = await messageService.startConversation(
        Number(recipientSelect),
        newChatPetSelect ? Number(newChatPetSelect) : null,
        newChatMessage.trim() || null
      );
      setNewChatModalOpen(false);
      setRecipientSelect('');
      setNewChatPetSelect('');
      setNewChatMessage('');
      if (addToast) addToast('Conversation opened successfully!', 'success');
      loadConversations();
      if (res && res.conversation_id) {
        setActiveConvId(res.conversation_id);
      }
    } catch (err) {
      console.error('Error starting new chat:', err);
      if (addToast) addToast('Could not start conversation. Please try again.', 'error');
    }
  };

  // Safe list of conversations (NO mock fallback)
  const convList = dbConversations !== null ? dbConversations : [];
  const activeConv = convList.find(c => c.id === activeConvId) || convList[0];

  // Resolve related pet
  const relatedPet = activeConv?.relatedPetId
    ? (pets.find(p => String(p.id) === String(activeConv.relatedPetId) || String(p.rawId) === String(activeConv.relatedPetId)) || activeConv.petReport)
    : null;

  const filteredConversations = convList.filter(c =>
    (c.participantName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.relatedPetName || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <button
          onClick={() => setNewChatModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
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
            {loadingConversations ? (
              <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500" />
                <p>Loading discussions...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setSearchParams({ convId: conv.id });
                    }}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-50/80 border-l-4 border-amber-500'
                        : 'hover:bg-stone-100/60'
                    }`}
                  >
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="w-10 h-10 rounded-full object-cover border border-amber-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-xs text-stone-900 truncate">
                          {conv.participantName}
                        </h4>
                        <span className="text-[10px] text-stone-400 flex-shrink-0">
                          {conv.lastTimestamp}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1 leading-snug">
                        {conv.lastMessage}
                      </p>
                      {conv.relatedPetName && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-800 font-semibold truncate">
                          <PawPrint className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span className="truncate">{conv.relatedPetName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-semibold text-stone-600">No active discussions</p>
                <p className="text-[11px] leading-relaxed">
                  Start a conversation from any pet report or sighting card to coordinate reunions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        {activeConv ? (
          <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-between h-[640px] bg-white">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.participantAvatar}
                  alt={activeConv.participantName}
                  className="w-10 h-10 rounded-full object-cover border border-amber-300"
                />
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    {activeConv.participantName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Pet Community Member</span>
                  </div>
                </div>
              </div>

              {activeConv.participantPhone && (
                <a
                  href={`tel:${activeConv.participantPhone}`}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call {activeConv.participantPhone}</span>
                </a>
              )}
            </div>

            {/* Pinned Pet Reference Card */}
            {relatedPet && (
              <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={relatedPet.images?.[0] || relatedPet.image || activeConv.relatedPetImage}
                    alt={relatedPet.petName || 'Pet'}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-xs text-stone-900 truncate">
                        {relatedPet.petName || activeConv.relatedPetName}
                      </span>
                      <Badge type={relatedPet.type || relatedPet.reportType || 'lost'} size="sm" />
                    </div>
                    <p className="text-[11px] text-stone-600 truncate">
                      {relatedPet.breed || 'Pet'} • {relatedPet.township || 'Yangon'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPetForModal(relatedPet)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/50 text-[11px] font-bold transition flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-2xs"
                >
                  <span>Report Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="text-center my-2">
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                  Real-time Pet Community Discussion
                </span>
              </div>

              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : activeMessages.length > 0 ? (
                activeMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        msg.isMe
                          ? 'bg-amber-500 text-white rounded-br-none'
                          : 'bg-stone-100 text-stone-900 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400">
                      <span>{msg.timestamp}</span>
                      {msg.isMe && <CheckCheck className="w-3 h-3 text-amber-600" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-stone-400 text-xs space-y-1">
                  <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="font-semibold text-stone-700">No messages in this conversation yet</p>
                  <p className="text-[11px]">Send a greeting below to coordinate reunion details!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-stone-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Write a message to ${activeConv.participantName}...`}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`p-2.5 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer ${
                  inputText.trim() && !isSending
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

          </div>
        ) : (
          <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-8 text-center bg-white space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-black text-xl text-stone-900">
                Direct Pet Sighting & Reunion Messages
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Connect with community members who spotted a missing pet or posted a found companion in your area.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setNewChatModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                Start New Discussion
              </button>
              <button
                onClick={() => navigate('/user/pet-reports')}
                className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                Browse Pet Reports
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Start New Discussion */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-lg text-stone-900">Start Community Discussion</h3>
              </div>
              <button
                onClick={() => setNewChatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  Select Recipient / Caretaker *
                </label>
                <select
                  value={recipientSelect}
                  onChange={(e) => setRecipientSelect(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                >
                  <option value="">-- Choose a Community Member --</option>
                  <option value="1">Kyaw Zin Htet (Lost Pet Owner - Milo)</option>
                  <option value="2">Ma Sandar (Finder / Caretaker - Rescued Pup)</option>
                  <option value="3">Ko Aung Naing (Lost Pet Owner - Bella)</option>
                  <option value="4">Dr. Lin Myat (Vet & Responder)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  Related Pet Report (Optional)
                </label>
                <select
                  value={newChatPetSelect}
                  onChange={(e) => setNewChatPetSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                >
                  <option value="">-- No specific pet / General Inquiry --</option>
                  {pets.map(p => (
                    <option key={p.id} value={p.rawId || p.id}>
                      #{p.id} - {p.petName} ({p.reportType?.toUpperCase()} • {p.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  Opening Message *
                </label>
                <textarea
                  rows="3"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  required
                  placeholder="Hello, I saw your pet report and wanted to check..."
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewChatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 transition cursor-pointer"
                >
                  Open Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MessagesPage;
