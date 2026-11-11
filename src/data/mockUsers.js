// Realistic mock user data
export const initialUsers = [
  {
    id: 'u1',
    name: 'Kyaw Zin Htet',
    email: 'kyawzin@gmail.com',
    phone: '+95 9 798 123 456',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    location: 'Kamayut, Yangon',
    joinedDate: '2026-01-15',
    bio: 'Pet lover and golden retriever owner. Always eager to help reunite lost pets with their families.'
  },
  {
    id: 'u2',
    name: 'Su Myat Noe',
    email: 'sumyat@gmail.com',
    phone: '+95 9 450 789 123',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    location: 'Bahan, Yangon',
    joinedDate: '2026-02-10',
    bio: 'Cat rescuer and animal welfare volunteer in Yangon.'
  },
  {
    id: 'u3',
    name: 'Aung Ko Ko',
    email: 'aungko@gmail.com',
    phone: '+95 9 250 112 334',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    location: 'Chanayethazan, Mandalay',
    joinedDate: '2026-03-01',
    bio: 'Veterinary assistant and community volunteer.'
  },
  {
    id: 'u4',
    name: 'May Thu Zar',
    email: 'maythu@gmail.com',
    phone: '+95 9 970 889 001',
    role: 'user',
    status: 'Suspended',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    location: 'Hledan, Yangon',
    joinedDate: '2026-02-28',
    bio: 'Pet parent.'
  },
  {
    id: 'u_admin',
    name: 'System Admin',
    email: 'admin@petfind.org',
    phone: '+95 9 111 222 333',
    role: 'admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    location: 'Naypyidaw',
    joinedDate: '2025-10-01',
    bio: 'Lead administrator for Community Pet Lost & Found platform.'
  }
];

export const currentUser = initialUsers[0]; // Logged in as Kyaw Zin Htet
