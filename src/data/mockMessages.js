// Mock messages and conversations
export const initialConversations = [
  {
    id: 'c1',
    participantId: 'u2',
    participantName: 'Su Myat Noe',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    relatedPetId: 'p2',
    relatedPetName: 'Found Golden Retriever (Possible Milo)',
    lastMessage: 'Let me know if you can come visit to verify if this is Milo!',
    lastTimestamp: '10:45 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'u2',
        senderName: 'Su Myat Noe',
        text: 'Hi Kyaw Zin! I saw your lost report for Milo. I found a very similar Golden Retriever in Bahan yesterday morning.',
        timestamp: '10:30 AM',
        isMe: false
      },
      {
        id: 'm2',
        senderId: 'u1',
        senderName: 'Kyaw Zin Htet',
        text: 'Hello Su Myat! Does he have a small white patch under his chest collar area? And is he answering to the word "treat"?',
        timestamp: '10:35 AM',
        isMe: true
      },
      {
        id: 'm3',
        senderId: 'u2',
        senderName: 'Su Myat Noe',
        text: 'Yes! He definitely has the white patch! He wagged his tail enthusiastically when I called him.',
        timestamp: '10:40 AM',
        isMe: false
      },
      {
        id: 'm4',
        senderId: 'u2',
        senderName: 'Su Myat Noe',
        text: 'Let me know if you can come visit to verify if this is Milo!',
        timestamp: '10:45 AM',
        isMe: false
      }
    ]
  },
  {
    id: 'c2',
    participantId: 'u3',
    participantName: 'Aung Ko Ko',
    participantAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    relatedPetId: 'p6',
    relatedPetName: 'Rocky (Corgi)',
    lastMessage: 'I checked our clinic records; will notify you if someone brings him in.',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm201',
        senderId: 'u1',
        senderName: 'Kyaw Zin Htet',
        text: 'Hi Dr. Aung Ko Ko, please keep an eye out for a tricolor corgi named Rocky in case someone brings him for a checkup.',
        timestamp: 'Yesterday 3:00 PM',
        isMe: true
      },
      {
        id: 'm202',
        senderId: 'u3',
        senderName: 'Aung Ko Ko',
        text: 'I checked our clinic records; will notify you if someone brings him in.',
        timestamp: 'Yesterday 3:20 PM',
        isMe: false
      }
    ]
  }
];
