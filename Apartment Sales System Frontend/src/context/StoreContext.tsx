import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Apartment, Unit, ExternalApartment, Promotion, Booking, Payment,
  BookingPayload, AvailabilityStatus
} from '../types';
import {
  apartmentsApi, unitsApi, bookingsApi, paymentsApi,
  promotionsApi, externalApartmentsApi
} from '../services/api';

interface StoreContextType {
  apartments: Apartment[];
  units: Unit[];
  externalApartments: ExternalApartment[];
  promotions: Promotion[];
  bookings: Booking[];
  payments: Payment[];
  isBackendConnected: boolean;
  createBooking: (payload: BookingPayload) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  updateUnitStatus: (unitId: string, status: AvailabilityStatus) => Promise<void>;
  addApartment: (data: Partial<Apartment> & { name: string; location: string }) => Promise<void>;
  addUnit: (data: Partial<Unit> & { unitPrice: number; floor: number }) => Promise<void>;
  addPromotion: (data: Partial<Promotion>) => Promise<void>;
  addExternalApartment: (data: Partial<ExternalApartment>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function localGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [externalApartments, setExternalApartments] = useState<ExternalApartment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const [aptsRes, unitsRes, promosRes, exAptsRes] = await Promise.allSettled([
          apartmentsApi.getAll(),
          unitsApi.getAll(),
          promotionsApi.getAll(),
          externalApartmentsApi.getAll()
        ]);

        if (aptsRes.status === 'fulfilled' && Array.isArray(aptsRes.value) && aptsRes.value.length > 0) {
          const mappedApts = aptsRes.value.map((apt: any) => ({
            ...apt,
            id: apt.apartmentId || apt.id,
            name: apt.name || (apt.location ? apt.location.split('—')[0].trim() : `Apartment ${apt.apartmentId}`),
            location: apt.location || 'Colombo',
            priceRange: apt.priceRange || '$200,000 - $500,000',
            numOfUnitsAvilable: apt.numOfUnitsAvilable || apt.numOfUnitsAvailable || 10,
            images: apt.images || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
          }));
          setApartments(mappedApts);
          setIsBackendConnected(true);
        }


        if (unitsRes.status === 'fulfilled' && Array.isArray(unitsRes.value) && unitsRes.value.length > 0) {
          const mappedUnits = unitsRes.value.map((u: any) => ({
            ...u,
            avilability: u.availability || u.avilability || 'Available'
          }));
          setUnits(mappedUnits);
        }

        if (promosRes.status === 'fulfilled' && Array.isArray(promosRes.value) && promosRes.value.length > 0) {
          setPromotions(promosRes.value);
        }

        if (exAptsRes.status === 'fulfilled' && Array.isArray(exAptsRes.value) && exAptsRes.value.length > 0) {
          setExternalApartments(exAptsRes.value);
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };
    fetchBackend();
  }, []);

  useEffect(() => { localStorage.setItem('livingora_apartments', JSON.stringify(apartments)); }, [apartments]);
  useEffect(() => { localStorage.setItem('livingora_units', JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem('livingora_ex_apartments', JSON.stringify(externalApartments)); }, [externalApartments]);
  useEffect(() => { localStorage.setItem('livingora_promotions', JSON.stringify(promotions)); }, [promotions]);
  useEffect(() => { localStorage.setItem('livingora_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('livingora_payments', JSON.stringify(payments)); }, [payments]);

  const createBooking = async (payload: BookingPayload): Promise<Booking> => {
    const bookingId = `BKG-${Date.now().toString().slice(-4)}`;
    const paymentId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;

    let apiRes: any = null;
    try {
      apiRes = await bookingsApi.create({
        unitId: payload.unitId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        paymentAmount: payload.paymentAmount,
        downPayment: payload.downPayment,
        paymentMethod: payload.paymentMethod,
        paymentProof: payload.paymentProof || 'receipt.pdf',
        months: payload.months || 36
      });
    } catch (e) {}

    const newBooking: Booking = {
      id: apiRes?.id || bookings.length + 1,
      bookingId: apiRes?.bookingId || bookingId,
      uid: payload.uid ?? 'USR-EXT-5001',
      userName: payload.userName,
      userEmail: payload.userEmail,
      unitId: payload.unitId,
      unitLocation: payload.unitLocation,
      bookingDate: new Date().toISOString().split('T')[0],
      expireDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: apiRes?.status || 'Pending Approval',
      additions: payload.additions,
      payment_id: paymentId,
      paymentAmount: payload.paymentAmount,
      downPayment: payload.downPayment,
      paymentMethod: payload.paymentMethod,
      paymentProof: payload.paymentProof,
    };

    const newPayment: Payment = {
      id: payments.length + 1,
      paymentId,
      bookingId: newBooking.bookingId,
      paymentAmount: payload.paymentAmount,
      pendingAmount: payload.unitPrice - payload.downPayment,
      paymentMethod: payload.paymentMethod,
      paymentProof: payload.paymentProof,
      dateAndTime: new Date().toISOString(),
      downPayment: payload.downPayment,
      numOfMonthsForPay: payload.months,
      status: 'Verification Pending',
    };

    setBookings(prev => [newBooking, ...prev]);
    setPayments(prev => [newPayment, ...prev]);
    updateUnitStatus(payload.unitId, 'Reserved');

    return newBooking;
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
    const target = bookings.find(b => b.bookingId === bookingId || String(b.id) === bookingId);
    if (target && target.id) {
      try { await bookingsApi.updateStatus(target.id, status); } catch (e) {}
    }

    setBookings(prev =>
      prev.map(b => {
        if (b.bookingId !== bookingId && String(b.id) !== bookingId) return b;
        if (status === 'Approved') {
          updateUnitStatus(b.unitId, 'Sold');
        } else if (status === 'Rejected') {
          updateUnitStatus(b.unitId, 'Available');
        }
        return { ...b, status };
      })
    );
  };

  const updateUnitStatus = async (unitId: string, status: AvailabilityStatus): Promise<void> => {
    try { await unitsApi.updateStatus(unitId, status); } catch (e) {}
    setUnits(prev => prev.map(u => u.unitId === unitId ? { ...u, avilability: status, availability: status } : u));
  };

  const addApartment = async (data: Partial<Apartment> & { name: string; location: string }): Promise<void> => {
    let created: any = null;
    try { created = await apartmentsApi.create(data); } catch (e) {}
    const newApt: Apartment = created || {
      apartmentId: `APT-ORA-0${apartments.length + 1}`,
      name: data.name,
      location: data.location,
      numOfRoom: data.numOfRoom ?? 50,
      numOfFloors: data.numOfFloors ?? 15,
      numOfSwimmingPool: data.numOfSwimmingPool ?? 1,
      numOfGYM: data.numOfGYM ?? 1,
      images: data.images ?? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      about: data.about ?? '',
      floorPlan: data.floorPlan ?? '',
      numOfUnitsAvilable: data.numOfUnitsAvilable ?? 10,
      priceRange: data.priceRange ?? '$200,000 - $600,000',
      unitStatus: data.unitStatus ?? 'Available',
      promotion_id: data.promotion_id ?? null,
      internalUser_empId: data.internalUser_empId ?? 'EMP-1002',
    };
    setApartments(prev => [...prev, newApt]);
  };

  const addUnit = async (data: Partial<Unit> & { unitPrice: number; floor: number }): Promise<void> => {
    let created: any = null;
    try { created = await unitsApi.create(data); } catch (e) {}
    const newUnit: Unit = created ? {
      ...created,
      avilability: created.availability || 'Available'
    } : {
      unitId: `UNT-${Math.floor(100 + Math.random() * 900)}-X`,
      apartment_id: data.apartment_id ?? 'APT-ORA-01',
      unitPrice: data.unitPrice,
      floor: data.floor,
      location: data.location ?? `Floor ${data.floor}`,
      avilability: 'Available',
      fernitures: data.fernitures ?? 'Fully Furnished',
      numOfBathRooms: data.numOfBathRooms ?? 2,
      numOfRooms: data.numOfRooms ?? 2,
      numOfBeds: data.numOfBeds ?? 2,
      acOrNonAC: data.acOrNonAC ?? 'AC',
      reccomendedPerson: data.reccomendedPerson ?? 'Executives',
      about: data.about ?? 'Luxury modern suite.',
      images: data.images ?? 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    };
    setUnits(prev => [...prev, newUnit]);
  };

  const addPromotion = async (data: Partial<Promotion>): Promise<void> => {
    let created: any = null;
    try { created = await promotionsApi.create(data); } catch (e) {}
    const newPromo: Promotion = created || {
      promotionId: `PROMO-${Date.now().toString().slice(-4)}`,
      promotionType: data.promotionType ?? 'Discount Code',
      promotionTitle: data.promotionTitle ?? 'New Promotion',
      about: data.about ?? '',
      eligibilityCriteria: data.eligibilityCriteria ?? 'All clients',
      startDate: data.startDate ?? new Date().toISOString().split('T')[0],
      endDate: data.endDate ?? '',
      buttonText: data.buttonText ?? 'Claim Offer',
      bannerImage: data.bannerImage ?? '',
      validityPeriod: data.validityPeriod ?? 'Limited Offer',
      discountPrecentage: data.discountPrecentage ?? 10,
      promotionCode: data.promotionCode ?? 'NEWCODE',
    };
    setPromotions(prev => [newPromo, ...prev]);
  };

  const addExternalApartment = async (data: Partial<ExternalApartment>): Promise<void> => {
    let created: any = null;
    try { created = await externalApartmentsApi.create(data); } catch (e) {}
    const newEx: ExternalApartment = created || {
      exApartmentId: `EXT-APT-${Math.floor(100 + Math.random() * 900)}`,
      location: data.location ?? '',
      about: data.about ?? '',
      numOfRooms: data.numOfRooms ?? 2,
      price: data.price ?? 0,
      downPayment: data.downPayment ?? 0,
      images: data.images ?? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      acOrNonAC: data.acOrNonAC ?? 'AC',
      additionalInfo: data.additionalInfo ?? '',
    };
    setExternalApartments(prev => [newEx, ...prev]);
  };

  return (
    <StoreContext.Provider value={{
      apartments, units, externalApartments, promotions, bookings, payments, isBackendConnected,
      createBooking, updateBookingStatus, updateUnitStatus,
      addApartment, addUnit, addPromotion, addExternalApartment,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
