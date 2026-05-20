export interface Lead {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  category: string;
  status: 'new' | 'saved' | 'contacted' | 'interested' | 'rejected';
  createdAt: number;
}

export interface Campaign {
  id: string;
  ownerId: string;
  name: string;
  leadIds: string[];
  status: 'draft' | 'active' | 'completed';
  intervalMinutes: number;
  messageTemplate?: string;
  createdAt: number;
  updatedAt?: number;
  lastSentAt?: number;
}
