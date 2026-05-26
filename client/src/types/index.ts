export type PackageType = 'Family' | 'Private' | 'Honeymoon' | 'Ramadan' | 'Island' | 'City';

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface Package {
  id: string;
  title: string;
  type: PackageType;
  destination: string;
  location: string;
  duration: string;
  price: string;
  priceValue: number;
  childPrice?: string;
  description: string;
  images: string[];
  imageGradient: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  included: string[];
  excluded?: string[];
  rating: number;
  reviewCount: number;
  isHalalCertified: boolean;
}

export interface TripRequest {
  id: string;
  destination: string;
  dates: string;
  travellers: string;
  budget: string;
  needs: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  familySize: string;
  budget: string;
  preferences: string;
}

export interface SearchState {
  destination: string;
  dates: string;
  travellers: string;
}

export interface ToastState {
  message: string;
  visible: boolean;
  type: 'default' | 'success' | 'error';
}

export interface BookingOrder {
  packageId: string;
  packageTitle: string;
  travellers: number;
  pricePerPerson: number;
  totalAmount: number; // cents
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}
