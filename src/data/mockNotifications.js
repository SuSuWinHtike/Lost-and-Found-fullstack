// Mock notifications for User & Admin
export const initialNotifications = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'match',
    title: 'Possible Match Found! (94%)',
    message: 'A Found Golden Retriever in Bahan matches your lost report for Milo.',
    timestamp: '10 minutes ago',
    read: false,
    petId: 'p2',
    link: '/user/matches'
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'message',
    title: 'New Message from Su Myat Noe',
    message: '"Hello Kyaw, I think I saw your dog near Shwedagon West Gate yesterday..."',
    timestamp: '1 hour ago',
    read: false,
    link: '/user/messages'
  },
  {
    id: 'n3',
    userId: 'u1',
    type: 'sighting',
    title: 'Community Sighting Submitted',
    message: 'A neighbor spotted a dog resembling Rocky near Hledan Market.',
    timestamp: '1 day ago',
    read: true,
    petId: 'p6',
    link: '/user/community'
  },
  {
    id: 'n4',
    userId: 'u1',
    type: 'status',
    title: 'Report Approved by Admin',
    message: 'Your lost report for "Milo" has been verified and is now live on the public board.',
    timestamp: '2 days ago',
    read: true,
    petId: 'p1',
    link: '/user/my-reports'
  },
  {
    id: 'n5',
    userId: 'u2',
    type: 'match',
    title: 'Match Alert: 90% Similarity',
    message: 'Possible match found for your lost cat report.',
    timestamp: '3 days ago',
    read: true,
    petId: 'p5',
    link: '/user/matches'
  }
];
