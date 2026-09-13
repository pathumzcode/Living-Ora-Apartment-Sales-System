// ==================== Core Domain Types ====================

export type AvailabilityStatus = 'Available' | 'Reserved' | 'Sold';
export type BookingStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Expired';
export type RoleType = 'EXTERNAL_USER' | 'INTERNAL_STAFF' | 'ADMIN' | 'GUEST';
export type PaymentMethod = 'Bank Transfer' | 'Online Credit Card' | 'Paypal / Stripe';

// ==================== Apartment & Units ====================

export interface Apartment {
  apartmentId: string;
  name: string;
  location: string;
  numOfRoom: number;
  numOfFloors: number;
  numOfSwimmingPool: number;
  numOfGYM: number;
  images: string;
  about: string;
  floorPlan: string;
  numOfUnitsAvilable: number;
  priceRange: string;
  unitStatus: AvailabilityStatus;
  promotion_id: string | null;
  internalUser_empId: string;
}

export interface Unit {
  unitId: string;
  apartment_id: string;
  unitPrice: number;
  floor: number;
  location: string;
  avilability: AvailabilityStatus;
  fernitures: string;
  numOfBathRooms: number;
  numOfRooms: number;
  numOfBeds: number;
  acOrNonAC: 'AC' | 'Non-AC';
  reccomendedPerson: string;
  about: string;
  images: string;
}

export interface ExternalApartment {
  exApartmentId: string;
  location: string;
  about: string;
  numOfRooms: number;
  price: number;
  downPayment: number;
  images: string;
  acOrNonAC: 'AC' | 'Non-AC';
  additionalInfo: string;
}

// ==================== Bookings & Payments ====================

export interface Booking {
  id: number;
  bookingId: string;
  uid: string;
  userName: string;
  userEmail: string;
  unitId: string;
  unitLocation: string;
  bookingDate: string;
  expireDate: string;
  status: BookingStatus;
  additions: string;
  payment_id: string | number;
  paymentAmount: number;
  downPayment: number;
  paymentMethod: PaymentMethod;
  paymentProof: string;
}

export interface Payment {
  id: number;
  paymentId: string;
  bookingId: string;
  paymentAmount: number;
  pendingAmount: number;
  paymentMethod: PaymentMethod;
  paymentProof: string;
  dateAndTime: string;
  downPayment: number;
  numOfMonthsForPay: number;
  status: 'Verification Pending' | 'Verified' | 'Rejected';
}

// ==================== Promotions ====================

export interface Promotion {
  promotionId: string;
  promotionType: string;
  promotionTitle: string;
  about: string;
  eligibilityCriteria: string;
  startDate: string;
  endDate: string;
  buttonText: string;
  bannerImage: string;
  validityPeriod: string;
  discountPrecentage: number;
  assinedApartment?: number | null;
  campaignPerformance?: string | null;
  promotionCode: string;
}

// ==================== Users ====================

export interface ExternalUserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  phoneNumber: string;
  nic: string;
  address: string;
  age: number;
  profilePicture: string;
}

export interface InternalUserProfile {
  empId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  companyEmail: string;
  phoneNumber: string;
  nic: string;
  serviceYears: number;
  profilePicture: string;
}

export type AnyUser = ExternalUserProfile | InternalUserProfile;

// ==================== Booking Creation Payload ====================

export interface BookingPayload {
  uid?: string;
  userName: string;
  userEmail: string;
  unitId: string;
  unitLocation: string;
  paymentAmount: number;
  downPayment: number;
  paymentMethod: PaymentMethod;
  paymentProof: string;
  additions: string;
  months: number;
  unitPrice: number;
}

// ==================== Page Navigation ====================

export type PageId =
  | 'home'
  | 'apartments'
  | 'apartment-detail'
  | 'external'
  | 'promotions'
  | 'customer-dashboard'
  | 'staff-dashboard'
  | 'auth';
