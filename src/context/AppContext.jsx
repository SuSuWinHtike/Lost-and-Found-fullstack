import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import petReportService from '../services/petReportService';
import locationService from '../services/locationService';
import sightingService from '../services/sightingService';
import messageService from '../services/messageService';
import notificationService from '../services/notificationService';
import dashboardService from '../services/dashboardService';

import { initialPets } from '../data/mockPets';
import { initialNotifications } from '../data/mockNotifications';
import { initialConversations } from '../data/mockMessages';
import { initialSightings, initialAnnouncements, initialComplaints } from '../data/mockSightings';
import { initialLocations } from '../data/mockLocations';
import { initialPetTypes, initialBreeds, initialColours } from '../data/mockCategories';
import { initialUsers } from '../data/mockUsers';

const AppContext = createContext();

// Helper to format backend pet report into frontend card structure
export const formatPetForFrontend = (report) => {
  if (!report) return null;
  const images = (report.images && report.images.length > 0)
    ? report.images.map(img => {
        const path = img.image_path || img;
        if (typeof path === 'string' && path.startsWith('/storage')) {
          return 'http://127.0.0.1:8000' + path;
        }
        return path;
      })
    : [
        (report.category?.name?.toLowerCase() === 'cat' || report.petType === 'Cat')
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
      ];

  const regionName = report.state_region?.name || report.stateRegion?.name || report.stateRegion || report.region || 'Yangon Region';
  const townshipName = report.township?.name || report.township || 'Hlaing Township';
  const petTypeName = report.category?.name || report.petType || report.species || 'Dog';
  const breedName = report.breed?.name || report.breed || 'Mixed Breed';
  const colorName = report.color?.name || report.secondary_color || report.colour || report.color || 'Golden / Cream';
  const dateVal = report.event_date ? (typeof report.event_date === 'string' ? report.event_date.split('T')[0] : report.event_date) : (report.date || '2026-11-11');
  const timeVal = report.event_time || report.time || '12:00';
  const genderVal = report.gender ? (report.gender.charAt(0).toUpperCase() + report.gender.slice(1).toLowerCase()) : 'Unknown';

  return {
    id: report.id,
    rawId: report.id,
    petName: report.pet_name || (report.type === 'found' ? 'Found Pet' : 'Missing Pet'),
    reportType: report.type || report.reportType || 'lost',
    // Both aliases supported for seamless UI rendering
    petType: petTypeName,
    species: petTypeName,
    breed: breedName,
    colour: colorName,
    color: colorName,
    secondaryColor: report.secondary_color || '',
    gender: genderVal,
    age: report.age || 'Unknown',
    region: regionName,
    stateRegion: regionName,
    city: regionName.replace(' Region', '').replace(' State', ''),
    township: townshipName,
    exactLocation: report.last_seen_or_found_location || report.exactLocation || `${townshipName}, ${regionName}`,
    location: report.last_seen_or_found_location || `${townshipName}, ${regionName}`,
    date: dateVal,
    time: timeVal,
    reportedDate: dateVal,
    description: report.description || '',
    reward: report.reward_amount || report.reward || null,
    collar: report.collar_description || report.collar || 'None',
    microchipped: !!(report.microchip_id || report.microchipped),
    microchip: report.microchip_id || null,
    appearance: report.physical_condition || report.appearance || 'Healthy',
    condition: report.physical_condition || report.condition || 'Healthy',
    holdingLocation: report.safe_holding_location || report.holdingLocation || null,
    status: report.status === 'approved' ? 'Approved' : (report.status === 'reunited' ? 'Reunited' : (report.status === 'pending' ? 'Pending' : 'Approved')),
    images,
    userName: report.contact_name || report.user?.name || report.userName || 'Pet Caretaker',
    userPhone: report.contact_phone || report.user?.phone || report.userPhone || '09-450-123-789',
    userEmail: report.user?.email || report.userEmail || '',
    owner: {
      id: report.user?.id || 'u1',
      name: report.contact_name || report.user?.name || 'Pet Caretaker',
      phone: report.contact_phone || report.user?.phone || '09-450-123-789',
      avatar: report.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
    is_favorited: !!report.is_favorited,
  };
};

export const AppProvider = ({ children }) => {
  // Current user and authentication
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [currentRole, setCurrentRole] = useState(() => {
    const user = authService.getCurrentUser();
    return user ? user.role : 'user';
  });

  // Main collections state
  const [pets, setPets] = useState(initialPets);
  const [users, setUsers] = useState(initialUsers);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [conversations, setConversations] = useState(initialConversations);
  const [sightings, setSightings] = useState(initialSightings);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [complaints, setComplaints] = useState(initialComplaints);

  // Categories & locations
  const [petTypes, setPetTypes] = useState(initialPetTypes);
  const [breeds, setBreeds] = useState(initialBreeds);
  const [colours, setColours] = useState(initialColours);
  const [locations, setLocations] = useState(initialLocations);

  // Global modals
  const [selectedPetForModal, setSelectedPetForModal] = useState(null);
  const [selectedSightingPet, setSelectedSightingPet] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState(['p1']);

  // Loading indicator for background API calls
  const [loading, setLoading] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 1. Fetch real pet reports from Laravel API
  const refreshPets = useCallback(async (filters = {}) => {
    try {
      const res = await petReportService.getPetReports(filters);
      if (res && res.data) {
        const formatted = res.data.map(formatPetForFrontend).filter(Boolean);
        setPets(formatted);
      }
    } catch (err) {
      console.error('Failed to load real pet reports from DB:', err);
    }
  }, []);

  // 2. Fetch real metadata (locations, categories, colors)
  const refreshMetadata = useCallback(async () => {
    try {
      const [locs, cats, cols] = await Promise.all([
        locationService.getLocations(),
        locationService.getCategories(),
        locationService.getColors(),
      ]);

      if (locs && locs.length > 0) {
        setLocations(locs.map(l => ({
          id: l.id,
          region: l.name,
          cities: [{ cityName: l.name, townships: l.townships?.map(t => t.name) || [] }]
        })));
      }

      if (cats && cats.length > 0) {
        setPetTypes(cats.map(c => ({ id: c.id, name: c.name, icon: c.slug })));
        const allBreeds = [];
        cats.forEach(c => {
          c.breeds?.forEach(b => {
            allBreeds.push({ id: b.id, petType: c.name, name: b.name });
          });
        });
        if (allBreeds.length > 0) setBreeds(allBreeds);
      }

      if (cols && cols.length > 0) {
        setColours(cols.map(c => ({ id: c.id, name: c.name, hex: c.hex_code || '#D97706' })));
      }
    } catch {
      // Keep initial fallback values
    }
  }, []);

  // 3. Fetch user notifications
  const refreshNotifications = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const res = await notificationService.getNotifications();
      if (res.data) {
        setNotifications(res.data.map(n => ({
          id: n.id,
          userId: n.user_id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: !!n.is_read,
          link: n.action_url || '/user/notifications',
        })));
        setUnreadNotifCount(res.unread_count || 0);
      }
    } catch {
      // Ignore
    }
  }, []);

  // 4. Fetch community sightings from MySQL database
  const refreshSightings = useCallback(async () => {
    try {
      const res = await sightingService.getSightings();
      if (res && res.data) {
        setSightings(res.data.map(s => {
          const photoUrl = s.images?.[0]?.image_path 
            ? (s.images[0].image_path.startsWith('/storage') ? 'http://127.0.0.1:8000' + s.images[0].image_path : s.images[0].image_path)
            : (s.pet_report?.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80');

          return {
            id: s.id,
            petId: s.pet_report_id,
            pet_report_id: s.pet_report_id,
            petName: s.pet_report?.pet_name || 'Pet',
            petType: s.pet_report?.category?.name || 'Dog',
            breed: s.pet_report?.breed?.name || 'Mixed Breed',
            color: s.pet_report?.color?.name || 'Unknown',
            petImage: s.pet_report?.images?.[0]?.image_path || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
            submitterName: s.user?.name || 'Community Member',
            submitterPhone: s.user?.phone || '09-798-654-321',
            sightingDate: s.sighting_date ? (typeof s.sighting_date === 'string' ? s.sighting_date.split('T')[0] : s.sighting_date) : 'Today',
            sightingTime: s.sighting_time || 'Morning',
            location: s.location_details,
            township: s.township?.name || 'Kamayut Township',
            stateRegion: s.state_region?.name || 'Yangon Region',
            notes: s.witness_notes,
            photo: photoUrl,
            image: photoUrl,
            verified: s.status === 'approved',
            likes: 3,
            petOwnerId: s.pet_report?.user_id,
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load real sightings from DB:', err);
    }
  }, []);

  // 5. Fetch real users list
  const refreshUsers = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const res = await api.get('/users');
      if (res.data?.data) {
        setUsers(res.data.data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role === 'admin' ? 'Administrator' : 'User',
          status: u.status === 'active' ? 'Active' : 'Suspended',
          location: u.township ? `${u.township}, ${u.state_region || ''}` : 'Yangon',
          joinedDate: u.created_at ? u.created_at.split('T')[0] : '2026-11-11',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        })));
      }
    } catch {
      // Keep fallback
    }
  }, []);

  const toggleUserStatus = async (id) => {
    try {
      await api.post(`/users/${id}/toggle-status`);
      refreshUsers();
      addToast('User account status updated in MySQL.', 'success');
    } catch {
      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      }));
    }
  };

  // Initial load on mount
  useEffect(() => {
    refreshPets();
    refreshMetadata();
    refreshSightings();
    if (authService.isAuthenticated()) {
      authService.getMe()
        .then(user => {
          setCurrentUser(user);
          setCurrentRole(user.role);
          refreshNotifications();
          refreshUsers();
        })
        .catch(() => {
          // Token expired or invalid
        });
    }
  }, [refreshPets, refreshMetadata, refreshSightings, refreshNotifications, refreshUsers]);

  // Authentication: Real Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      setCurrentUser(res.user);
      setCurrentRole(res.user.role);
      addToast(res.message || `Welcome back, ${res.user.name}!`, 'success');
      refreshPets();
      refreshNotifications();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Real Register
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      setCurrentUser(res.user);
      setCurrentRole(res.user.role);
      addToast(res.message || `Account created successfully! Welcome ${res.user.name}.`, 'success');
      refreshPets();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : 'Registration failed.';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Authentication: Real Logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setCurrentRole('user');
      addToast('Signed out successfully.', 'info');
    }
  };

  // Switch role helper for quick testing
  const switchRole = async (role) => {
    setCurrentRole(role);
    if (role === 'admin') {
      try {
        const res = await authService.login({ email: 'admin@petlove.org', password: 'admin123' });
        setCurrentUser(res.user);
        addToast('Logged in as Administrator (admin@petlove.org)', 'info');
      } catch {
        addToast('Admin demo login ready', 'info');
      }
    } else if (role === 'user') {
      try {
        const res = await authService.login({ email: 'kyawzin@gmail.com', password: 'password123' });
        setCurrentUser(res.user);
        addToast('Logged in as Kyaw Zin Htet', 'info');
      } catch {
        addToast('User mode active', 'info');
      }
    } else {
      logout();
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (petId) => {
    const isFav = favorites.includes(petId);
    setFavorites(prev => isFav ? prev.filter(id => id !== petId) : [...prev, petId]);

    if (authService.isAuthenticated()) {
      try {
        const rawId = typeof petId === 'number' ? petId : parseInt(petId.replace(/\D/g, ''), 10) || 1;
        await petReportService.toggleFavorite(rawId);
      } catch {
        // Handled silently
      }
    }

    addToast(isFav ? 'Removed from saved bookmarks' : 'Added to saved bookmarks! ❤️', isFav ? 'info' : 'success');
  };

  // Create pet report in MySQL database via Laravel API
  const addPet = async (newPetData) => {
    setLoading(true);
    try {
      const res = await petReportService.createPetReport(newPetData);
      addToast(res.message || 'Report submitted successfully!', 'success');
      await refreshPets();
      return res.data;
    } catch (err) {
      let msg = 'Failed to submit report.';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors)[0][0];
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePet = async (id, updatedFields) => {
    try {
      const rawId = typeof id === 'number' ? id : parseInt(id.replace(/\D/g, ''), 10);
      if (rawId && authService.isAuthenticated()) {
        await petReportService.updateMyReport(rawId, updatedFields);
      }
    } catch {
      // Fallback
    }
    setPets(prev => prev.map(pet => (pet.id === id || pet.rawId === id) ? { ...pet, ...updatedFields } : pet));
    addToast('Report updated successfully!', 'success');
  };

  const deletePet = async (id) => {
    try {
      const rawId = typeof id === 'number' ? id : parseInt(id.replace(/\D/g, ''), 10);
      if (rawId && authService.isAuthenticated()) {
        await petReportService.deleteMyReport(rawId);
      }
    } catch {
      // Fallback
    }
    setPets(prev => prev.filter(pet => pet.id !== id && pet.rawId !== id));
    addToast('Report deleted successfully.', 'info');
  };

  const markPetReunited = async (id) => {
    try {
      const rawId = typeof id === 'number' ? id : parseInt(id.replace(/\D/g, ''), 10);
      if (rawId && authService.isAuthenticated()) {
        await petReportService.markAsReunited(rawId);
      }
    } catch {
      // Fallback
    }
    setPets(prev => prev.map(pet => (pet.id === id || pet.rawId === id) ? { ...pet, status: 'Reunited' } : pet));
    addToast('🎉 Wonderful news! Pet marked as Reunited!', 'success');
  };

  // Submit Sighting to MySQL Database
  const addSighting = async (sightingData) => {
    setLoading(true);
    try {
      const res = await sightingService.createSighting(sightingData);
      addToast(res.message || 'Sighting reported! The pet owner has been alerted.', 'success');
      await refreshSightings();
      await refreshNotifications();
      return res;
    } catch (err) {
      let msg = 'Failed to submit sighting.';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors)[0][0];
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Direct Messaging
  const sendMessage = async (conversationId, text) => {
    if (!text.trim()) return;

    if (authService.isAuthenticated() && typeof conversationId === 'number') {
      try {
        const msg = await messageService.sendMessage(conversationId, text);
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: text,
              lastTimestamp: 'Just now',
              messages: [...(conv.messages || []), {
                id: msg.id,
                senderId: msg.sender_id,
                senderName: currentUser?.name || 'Me',
                text: msg.message_text,
                timestamp: 'Just now',
                isMe: true
              }]
            };
          }
          return conv;
        }));
        return;
      } catch {
        // Fallback to local
      }
    }

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
          messages: [...(conv.messages || []), newMessage]
        };
      }
      return conv;
    }));
  };

  // Notifications
  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (authService.isAuthenticated()) {
      try {
        await notificationService.markAsRead(id);
      } catch {
        // Ignore
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifCount(0);
    if (authService.isAuthenticated()) {
      try {
        await notificationService.markAllAsRead();
      } catch {
        // Ignore
      }
    }
    addToast('All notifications marked as read.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        switchRole,
        login,
        register,
        logout,
        loading,
        pets,
        refreshPets,
        addPet,
        updatePet,
        deletePet,
        markPetReunited,
        users,
        refreshUsers,
        toggleUserStatus,
        notifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        conversations,
        sendMessage,
        sightings,
        refreshSightings,
        addSighting,
        petTypes,
        breeds,
        colours,
        locations,
        toasts,
        addToast,
        removeToast,
        selectedPetForModal,
        setSelectedPetForModal,
        selectedSightingPet,
        setSelectedSightingPet,
        favorites,
        toggleFavorite,
        announcements,
        complaints,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
