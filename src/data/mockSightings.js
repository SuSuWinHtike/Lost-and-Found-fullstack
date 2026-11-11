// Community sighting submissions
export const initialSightings = [
  {
    id: 's1',
    petId: 'p1',
    petName: 'Milo',
    submitterName: 'Thant Zin',
    submitterPhone: '+95 9 512 889 001',
    sightingDate: '2026-03-23',
    sightingTime: '06:45 AM',
    location: 'Bahan, near West Shwedagon entrance road',
    notes: 'Saw a friendly golden retriever drinking water near a local stall. He appeared gentle and was walking towards the monastery.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    verified: true,
    likes: 14,
    createdAt: '2026-03-23T07:15:00Z'
  },
  {
    id: 's2',
    petId: 'p6',
    petName: 'Rocky',
    submitterName: 'Nilar Win',
    submitterPhone: '+95 9 778 445 112',
    sightingDate: '2026-03-20',
    sightingTime: '05:30 PM',
    location: 'Hledan, 2nd Street near bakery',
    notes: 'A small tricolor corgi was spotted running across the sidewalk. Someone tried to offer bread.',
    image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
    verified: false,
    likes: 8,
    createdAt: '2026-03-20T18:00:00Z'
  },
  {
    id: 's3',
    petId: 'p4',
    petName: 'Simba',
    submitterName: 'Ko Myo',
    submitterPhone: '+95 9 421 990 887',
    sightingDate: '2026-03-24',
    sightingTime: '02:15 PM',
    location: 'Chanayethazan, 76th Street near tea shop',
    notes: 'Saw an orange tabby cat with white socks resting under a green bench.',
    image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=600&q=80',
    verified: true,
    likes: 5,
    createdAt: '2026-03-24T14:40:00Z'
  }
];

export const initialAnnouncements = [
  {
    id: 'a1',
    title: 'New Pet Microchipping Awareness Drive - Yangon & Mandalay',
    category: 'Public Welfare',
    priority: 'High',
    date: '2026-03-20',
    target: 'All Users',
    content: 'Free microchip scanning and discounted microchipping drive will be held this Saturday at designated veterinary clinics across Yangon and Mandalay.',
    published: true
  },
  {
    id: 'a2',
    title: 'Safety Advisory: Hot Season Hydration for Stray & Lost Pets',
    category: 'Safety Alert',
    priority: 'Normal',
    date: '2026-03-15',
    target: 'Public',
    content: 'As temperature peaks in mid-March, please place clean water bowls outside your homes to assist lost pets and community animals.',
    published: true
  },
  {
    id: 'a3',
    title: 'Platform Maintenance Scheduled for Sunday 2:00 AM',
    category: 'System',
    priority: 'Low',
    date: '2026-03-12',
    target: 'All Users',
    content: 'Brief 15-minute maintenance scheduled for system optimization and faster image delivery.',
    published: true
  }
];

export const initialComplaints = [
  {
    id: 'cmp1',
    complainantName: 'Su Myat Noe',
    complainantEmail: 'sumyat@gmail.com',
    reportedUserName: 'May Thu Zar',
    reportId: 'p9',
    reason: 'Suspected False Report / Inaccurate Location',
    description: 'User posted photos from a commercial breeder claiming it was a lost dog in Zabuthiri. Requesting admin verification.',
    status: 'Investigating', // Investigating / Resolved / Dismissed
    date: '2026-03-25',
    resolutionNote: ''
  },
  {
    id: 'cmp2',
    complainantName: 'Kyaw Zin Htet',
    complainantEmail: 'kyawzin@gmail.com',
    reportedUserName: 'Unknown Spammer',
    reportId: null,
    reason: 'Spam Message Solicitation',
    description: 'Received suspicious WhatsApp message asking for monetary transfer before returning pet.',
    status: 'Resolved',
    date: '2026-03-22',
    resolutionNote: 'User number flagged and advisory issued to community.'
  }
];
