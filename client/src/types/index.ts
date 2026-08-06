export type PackageType = 'Family' | 'Private' | 'Honeymoon' | 'Ramadan' | 'Island' | 'City';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

/** Per-locale overrides for a package's customer-facing copy. */
export interface PackageTranslation {
  title?: string;
  location?: string;
  duration?: string;
  description?: string;
  highlights?: string[];
  itinerary?: ItineraryDay[];
  included?: string[];
  excluded?: string[];
}

export interface Package {
  id: string;
  slug?: string;          // present when data comes from API
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
  /** Keyed by locale ('ms' | 'ar'); English lives in the fields above. */
  translations?: Record<string, PackageTranslation>;
}

export interface TripRequest {
  id: string;
  destination?: string;
  dates?: string;
  travellers?: string;
  budget?: string;
  needs?: string;
  guestName?: string;
  adults?: string;
  children?: string;
  childrenAges?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  mealPlan?: string;
  excursions?: string;
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

export interface Review {
  id: string;
  travellerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}
