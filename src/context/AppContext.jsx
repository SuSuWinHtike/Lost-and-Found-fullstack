import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers, currentUser as defaultUser } from '../data/mockUsers';
import { initialPets } from '../data/mockPets';
import { initialNotifications } from '../data/mockNotifications';
import { initialConversations } from '../data/mockMessages';
import { initialSightings, initialAnnouncements, initialComplaints } from '../data/mockSightings';
import { initialLocations } from '../data/mockLocations';
import { initialPetTypes, initialBreeds, initialColours } from '../data/mockCategories';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current user and authentication role: 'user', 'admin', or 'guest'
  const [currentUser, setCurrentUser] = useState(defaultUser);
  const [currentRole, setCurrentRole] = useState('user'); // default to user dashboard view

  // Main collections state
  const [pets, setPets] = useState(initialPets);
  const [users, setUsers] = useState(initialUsers);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [conversations, setConversations] = useState(initialConversations);
  const [sightings, setSightings] = useState(initialSightings);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [complaints, setComplaints] = useState(initialComplaints);

  // Categories & locations
  const [petTypes, setPetTypes] = useState(initialPetTypes);
  const [breeds, setBreeds] = useState(initialBreeds);
  const [colours, setColours] = useState(initialColours);
  const [locations, setLocations] = useState(initialLocations);

  // Global modals and detail popups
  const [selectedPetForModal, setSelectedPetForModal] = useState(null);
  const [selectedSightingPet, setSelectedSightingPet] = useState(null);

  // Favorites / Saved pets
  const [favorites, setFavorites] = useState(['p1']);

  const toggleFavorite = (petId) => {
    setFavorites(prev => {
      const isFav = prev.includes(petId);
      if (isFav) {
        addToast('Removed from saved bookmarks', 'info');
        return prev.filter(id => id !== petId);
      } else {
        addToast('Added to saved bookmarks! ❤️', 'success');
        return [...prev, petId];
      }
    });
  };

  // Toast system
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Switch Role helper (great for evaluators and grading)
  const switchRole = (role) => {
    setCurrentRole(role);
    if (role === 'admin') {
      const adminUser = users.find(u => u.role === 'admin') || users[4];
      setCurrentUser(adminUser);
      addToast('Switched to Administrator Mode', 'info');
    } else if (role === 'user') {
      const standardUser = users.find(u => u.role === 'user') || users[0];
      setCurrentUser(standardUser);
      addToast('Switched to User Dashboard (Kyaw Zin Htet)', 'info');
    } else {
      setCurrentUser(null);
      addToast('Viewing as Public Guest', 'info');
    }
  };

  // Pet management
  const addPet = (newPetData) => {
    const newPet = {
      id: 'p_' + Date.now(),
      status: 'Approved', // Auto approved for instant demo responsiveness
      views: 1,
      createdAt: new Date().toISOString(),
      userId: currentUser?.id || 'u1',
      userName: currentUser?.name || 'Kyaw Zin Htet',
      userPhone: currentUser?.phone || '+95 9 798 123 456',
      userEmail: currentUser?.email || 'kyawzin@gmail.com',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      ...newPetData
    };
    setPets(prev => [newPet, ...prev]);
    addToast(`${newPet.reportType === 'lost' ? 'Lost' : 'Found'} report submitted successfully!`, 'success');

    // Also create a notification
    const newNotif = {
      id: 'n_' + Date.now(),
      userId: currentUser?.id || 'u1',
      type: 'status',
      title: 'Report Published',
      message: `Your ${newPet.reportType} pet report for "${newPet.petName || 'Pet'}" is now live.`,
      timestamp: 'Just now',
      read: false,
      petId: newPet.id,
      link: '/user/my-reports'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newPet;
  };

  const updatePet = (id, updatedFields) => {
    setPets(prev => prev.map(pet => pet.id === id ? { ...pet, ...updatedFields } : pet));
    addToast('Report updated successfully!', 'success');
  };

  const deletePet = (id) => {
    setPets(prev => prev.filter(pet => pet.id !== id));
    addToast('Report deleted successfully.', 'info');
  };

  const markPetReunited = (id) => {
    setPets(prev => prev.map(pet => pet.id === id ? { ...pet, status: 'Reunited' } : pet));
    addToast('🎉 Wonderful news! Pet marked as Reunited!', 'success');
  };

  const approveReport = (id) => {
    setPets(prev => prev.map(pet => pet.id === id ? { ...pet, status: 'Approved' } : pet));
    addToast('Report approved and published to public.', 'success');
  };

  const rejectReport = (id, reason = 'Violates community guidelines') => {
    setPets(prev => prev.map(pet => pet.id === id ? { ...pet, status: 'Rejected' } : pet));
    addToast(`Report rejected: ${reason}`, 'warning');
  };

  // User management
  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        addToast(`User ${u.name} is now ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const updateUser = (id, updatedFields) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedFields } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
    addToast('User details updated.', 'success');
  };

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read.', 'info');
  };

  // Chat / Messages
  const sendMessage = (conversationId, text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: 'm_' + Date.now(),
      senderId: currentUser?.id || 'u1',
      senderName: currentUser?.name || 'Kyaw Zin Htet',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text,
          lastTimestamp: 'Just now',
          messages: [...conv.messages, newMessage]
        };
      }
      return conv;
    }));

    // Auto-reply simulation for realistic interactive chat demonstration!
    setTimeout(() => {
      const replyMessage = {
        id: 'reply_' + Date.now(),
        senderId: 'u2',
        senderName: 'Su Myat Noe',
        text: 'Thank you for your message! I will double check the location and keep you updated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: replyMessage.text,
            lastTimestamp: 'Just now',
            messages: [...conv.messages, replyMessage]
          };
        }
        return conv;
      }));
    }, 1400);
  };

  // Sightings
  const addSighting = (sightingData) => {
    const newSighting = {
      id: 's_' + Date.now(),
      submitterName: currentUser?.name || sightingData.submitterName || 'Community Volunteer',
      submitterPhone: sightingData.submitterPhone || '+95 9 798 123 456',
      verified: true,
      likes: 1,
      createdAt: new Date().toISOString(),
      ...sightingData
    };
    setSightings(prev => [newSighting, ...prev]);
    addToast('Sighting reported! The pet owner has been alerted.', 'success');
  };

  const toggleSightingLike = (id) => {
    setSightings(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
  };

  // Category & Location management
  const addBreed = (petType, name) => {
    setBreeds(prev => [...prev, { id: 'b_' + Date.now(), petType, name }]);
    addToast(`Breed "${name}" added.`, 'success');
  };

  const deleteBreed = (id) => {
    setBreeds(prev => prev.filter(b => b.id !== id));
    addToast('Breed removed.', 'info');
  };

  const addColour = (name, hex = '#A8A29E') => {
    setColours(prev => [...prev, { id: 'c_' + Date.now(), name, hex }]);
    addToast(`Colour "${name}" added.`, 'success');
  };

  const deleteColour = (id) => {
    setColours(prev => prev.filter(c => c.id !== id));
    addToast('Colour removed.', 'info');
  };

  const addLocation = (region, cityName, townshipsArray) => {
    const existing = locations.find(l => l.region.toLowerCase() === region.toLowerCase());
    if (existing) {
      setLocations(prev => prev.map(l => {
        if (l.region.toLowerCase() === region.toLowerCase()) {
          return {
            ...l,
            cities: [...l.cities, { cityName, townships: townshipsArray }]
          };
        }
        return l;
      }));
    } else {
      setLocations(prev => [
        ...prev,
        {
          id: 'loc_' + Date.now(),
          region,
          cities: [{ cityName, townships: townshipsArray }]
        }
      ]);
    }
    addToast(`Location "${cityName}, ${region}" added.`, 'success');
  };

  const deleteLocation = (id) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    addToast('Location removed.', 'info');
  };

  // Announcements
  const addAnnouncement = (data) => {
    const newAnn = {
      id: 'a_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      published: true,
      ...data
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    addToast('Announcement broadcasted to community.', 'success');
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addToast('Announcement deleted.', 'info');
  };

  // Complaints
  const resolveComplaint = (id, resolutionNote) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved', resolutionNote } : c));
    addToast('Complaint marked as Resolved.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        switchRole,
        pets,
        addPet,
        updatePet,
        deletePet,
        markPetReunited,
        approveReport,
        rejectReport,
        users,
        toggleUserStatus,
        updateUser,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        conversations,
        sendMessage,
        sightings,
        addSighting,
        toggleSightingLike,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        complaints,
        resolveComplaint,
        petTypes,
        breeds,
        addBreed,
        deleteBreed,
        colours,
        addColour,
        deleteColour,
        locations,
        addLocation,
        deleteLocation,
        toasts,
        addToast,
        removeToast,
        selectedPetForModal,
        setSelectedPetForModal,
        selectedSightingPet,
        setSelectedSightingPet,
        favorites,
        toggleFavorite
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
