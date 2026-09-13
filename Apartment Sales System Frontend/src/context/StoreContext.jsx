import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apartmentsApi,
  unitsApi,
  bookingsApi,
  paymentsApi,
  promotionsApi,
  externalApartmentsApi
} from '../services/api';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const FALLBACK_APARTMENTS = [
    {
      apartmentId: 'APT-LO-001', id: 'APT-LO-001',
      name: 'Living-Ora Heights',
      location: 'Colombo 03, Sri Lanka — Marine Drive',
      about: 'A considered home for modern coastal living. Floor-to-ceiling glass, ocean vistas, and resort-grade amenities define this signature development.',
      priceRange: '$220,000 – $850,000',
      numOfUnitsAvilable: 12, numOfFloors: 22, numOfSwimmingPool: 2, numOfGYM: 1,
      images: '/images/luxury-complex-marina.jpg', floorPlan: '/images/luxury-interior-lounge.jpg',
      unitStatus: 'Available'
    },
    {
      apartmentId: 'APT-LO-002', id: 'APT-LO-002',
      name: 'Ora Grand Residences',
      location: 'Colombo 07, Sri Lanka — Bauddhaloka Mawatha',
      about: 'Elegance meets urban sophistication. A landmark tower offering panoramic city views and exclusive penthouse suites for discerning buyers.',
      priceRange: '$310,000 – $1,200,000',
      numOfUnitsAvilable: 8, numOfFloors: 30, numOfSwimmingPool: 1, numOfGYM: 2,
      images: '/images/luxury-condo-exterior.jpg', floorPlan: '/images/luxury-interior-lounge.jpg',
      unitStatus: 'Available'
    },
    {
      apartmentId: 'APT-LO-003', id: 'APT-LO-003',
      name: 'Ora Waterfront Villas',
      location: 'Mount Lavinia, Sri Lanka — Beach Road',
      about: 'Sun-drenched waterfront villas with private pool access, tropical gardens, and direct beach frontage. The ultimate coastal lifestyle.',
      priceRange: '$450,000 – $1,800,000',
      numOfUnitsAvilable: 5, numOfFloors: 4, numOfSwimmingPool: 3, numOfGYM: 1,
      images: '/images/luxury-waterfront-residence.jpg', floorPlan: '/images/luxury-interior-lounge.jpg',
      unitStatus: 'Available'
    },
  ];

  const FALLBACK_UNITS = [
    { unitId: 'UNT-001', apartment_id: 'APT-LO-001', floor: 8, location: '8th Floor — Living-Ora Heights', unitPrice: 320000, numOfBeds: 2, numOfBathRooms: 2, numOfRooms: 2, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Luminous corner suite with dual ocean and city aspects. Expansive living area with premium Italian marble finishes.', images: '/images/luxury-interior-lounge.jpg', avilability: 'Available', availability: 'Available', recommendedPerson: 'Couple / Executive' },
    { unitId: 'UNT-002', apartment_id: 'APT-LO-001', floor: 15, location: '15th Floor — Living-Ora Heights', unitPrice: 480000, numOfBeds: 3, numOfBathRooms: 3, numOfRooms: 3, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Sky-high penthouse-style suite with wrap-around glass balconies and premium chef kitchen.', images: '/images/luxury-villa-hero.jpg', avilability: 'Available', availability: 'Available', recommendedPerson: 'Family' },
    { unitId: 'UNT-003', apartment_id: 'APT-LO-001', floor: 20, location: '20th Floor — Sky Penthouse', unitPrice: 850000, numOfBeds: 4, numOfBathRooms: 4, numOfRooms: 5, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'The pinnacle of Living-Ora luxury. Double-height ceilings, private sky terrace, and a full 360° panorama of Colombo.', images: '/images/luxury-complex-marina.jpg', avilability: 'Reserved', availability: 'Reserved', recommendedPerson: 'Executives / Families' },
    { unitId: 'UNT-004', apartment_id: 'APT-LO-002', floor: 12, location: '12th Floor — Ora Grand', unitPrice: 390000, numOfBeds: 2, numOfBathRooms: 2, numOfRooms: 2, acOrNonAC: 'AC', furnitures: 'Partially Furnished', about: 'Stylish urban suite with sweeping Colombo 07 views and designer-ready interiors.', images: '/images/luxury-condo-exterior.jpg', avilability: 'Available', availability: 'Available', recommendedPerson: 'Professional / Couple' },
    { unitId: 'UNT-005', apartment_id: 'APT-LO-002', floor: 25, location: '25th Floor — Ora Grand', unitPrice: 680000, numOfBeds: 3, numOfBathRooms: 3, numOfRooms: 4, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Breathtaking high-rise residence with private lift lobby, spa bathroom, and dedicated home office.', images: '/images/luxury-waterfront-residence.jpg', avilability: 'Available', availability: 'Available', recommendedPerson: 'Family' },
    { unitId: 'UNT-006', apartment_id: 'APT-LO-003', floor: 2, location: 'Villa 2 — Ora Waterfront', unitPrice: 520000, numOfBeds: 3, numOfBathRooms: 3, numOfRooms: 4, acOrNonAC: 'Non-AC', furnitures: 'Fully Furnished', about: 'Tropical waterfront villa with direct pool access, open plan living and a private garden retreat.', images: '/images/luxury-villa-hero.jpg', avilability: 'Available', availability: 'Available', recommendedPerson: 'Family' },
  ];

  const FALLBACK_PROMOTIONS = [
    { promotionId: 'PROMO-001', promotionType: 'Discount Code', promotionTitle: 'Early Bird Offer – Save 15%', about: 'Reserve your unit before end of November and receive an exclusive 15% discount on your total property price. Limited availability.', eligibilityCriteria: 'Minimum 20% Down Payment', startDate: '2026-09-10', endDate: '2026-11-30', buttonText: 'Claim Offer', bannerImage: '/images/luxury-complex-marina.jpg', validityPeriod: 'Limited Offer', discountPrecentage: 15.0, promotionCode: 'SAVE15NOW' },
    { promotionId: 'PROMO-002', promotionType: 'Furnishing Package', promotionTitle: 'Luxury Furnishing Package', about: 'Complement your new home with a curated collection of designer furniture, lighting, and bespoke finishes from our interior partners.', eligibilityCriteria: 'Units over $300,000', startDate: '2026-09-01', endDate: '2026-12-31', buttonText: 'View Package', bannerImage: '/images/luxury-interior-lounge.jpg', validityPeriod: 'While Stocks Last', discountPrecentage: 0, promotionCode: 'FURNISH2026' },
  ];

  const FALLBACK_EXTERNAL = [
    { externalApartmentId: 'EXT-001', location: 'Rajagiriya, Sri Lanka — Nawala Road', about: 'Modern 2-bedroom apartment with open plan kitchen, study nook, and parking. Ideal for young professionals.', numOfRooms: 2, price: 185000, downPayment: 18500, images: '/images/luxury-condo-exterior.jpg', acOrNonAC: 'AC', additionalInfo: 'Direct owner contact. No agency fee.' },
    { externalApartmentId: 'EXT-002', location: 'Nugegoda, Sri Lanka — High Level Road', about: 'Spacious 3-bedroom family apartment with two balconies, gated complex, and 24-hour security.', numOfRooms: 3, price: 230000, downPayment: 23000, images: '/images/luxury-villa-hero.jpg', acOrNonAC: 'AC', additionalInfo: 'Registered sales agent listing.' },
  ];

  const [apartments, setApartments] = useState(() => FALLBACK_APARTMENTS);
  const [units, setUnits] = useState(() => FALLBACK_UNITS);
  const [externalApartments, setExternalApartments] = useState(() => FALLBACK_EXTERNAL);
  const [promotions, setPromotions] = useState(() => FALLBACK_PROMOTIONS);
  const [bookings, setBookings] = useState(() => []);
  const [payments, setPayments] = useState(() => []);

  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync with Backend on Component Mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [aptsRes, unitsRes, promosRes, exAptsRes] = await Promise.allSettled([
          apartmentsApi.getAll(),
          unitsApi.getAll(),
          promotionsApi.getAll(),
          externalApartmentsApi.getAll()
        ]);

        if (aptsRes.status === 'fulfilled' && Array.isArray(aptsRes.value)) {
          const mappedApts = aptsRes.value.map(apt => ({
            ...apt,
            id: apt.apartmentId || apt.id,
            name: apt.name || (apt.location ? apt.location.split('—')[0].trim() : `Apartment ${apt.apartmentId}`),
            location: apt.location || 'Colombo',
            priceRange: apt.priceRange || '$200,000 - $500,000',
            numOfUnitsAvilable: apt.numOfUnitsAvilable || apt.numOfUnitsAvailable || 10,
            images: apt.images || (apt.apartmentId === 'APT-LO-002' ? '/images/living-ora-marina.svg' : '/images/living-ora-hero.svg'),
            floorPlan: apt.floorPlan || '/images/living-ora-interior.svg'
          }));
          setApartments(mappedApts);
          setIsBackendConnected(true);
        }


        if (unitsRes.status === 'fulfilled' && Array.isArray(unitsRes.value)) {
          const mappedUnits = unitsRes.value.map(u => ({
            ...u,
            avilability: u.availability || u.avilability || 'Available'
          }));
          setUnits(mappedUnits);
        }

        if (promosRes.status === 'fulfilled' && Array.isArray(promosRes.value)) {
          setPromotions(promosRes.value);
        }

        if (exAptsRes.status === 'fulfilled' && Array.isArray(exAptsRes.value)) {
          setExternalApartments(exAptsRes.value);
        }

        // Try load bookings & payments
        try {
          const bRes = await bookingsApi.getAll();
          if (Array.isArray(bRes)) {
            setBookings(bRes);
          }
        } catch (e) {
          // ignore if unauthenticated or empty
        }

        try {
          const pRes = await paymentsApi.getAll();
          if (Array.isArray(pRes)) {
            setPayments(pRes);
          }
        } catch (e) {
          // ignore if unauthenticated or empty
        }

      } catch (err) {
        console.warn('Backend server not connected. Operating in local storage mode:', err.message);
        setIsBackendConnected(false);
      }
    };

    loadBackendData();
  }, []);

  // Actions
  const createBooking = async (bookingPayload) => {
    const bookingId = `BKG-${Date.now().toString().slice(-4)}`;
    const paymentId = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;

    const apiBookingResult = await bookingsApi.create({
        unitId: bookingPayload.unitId,
        userName: bookingPayload.userName,
        userEmail: bookingPayload.userEmail,
        paymentAmount: bookingPayload.paymentAmount,
        downPayment: bookingPayload.downPayment,
        paymentMethod: bookingPayload.paymentMethod,
        paymentProof: bookingPayload.paymentProof || 'receipt.pdf',
        months: bookingPayload.months || 36
      });

    const newBooking = {
      id: apiBookingResult?.id || bookings.length + 1,
      bookingId: apiBookingResult?.bookingId || bookingId,
      uid: bookingPayload.uid || 'USR-EXT-5001',
      userName: bookingPayload.userName,
      userEmail: bookingPayload.userEmail,
      unitId: bookingPayload.unitId,
      unitLocation: bookingPayload.unitLocation,
      bookingDate: new Date().toISOString().split('T')[0],
      expireDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: apiBookingResult?.status || 'Pending Approval',
      additions: bookingPayload.additions || 'Standard Luxury Finish',
      payment_id: paymentId,
      paymentAmount: bookingPayload.paymentAmount,
      downPayment: bookingPayload.downPayment,
      paymentMethod: bookingPayload.paymentMethod,
      paymentProof: bookingPayload.paymentProof || 'receipt_attached.pdf'
    };

    const newPayment = {
      id: payments.length + 1,
      paymentId,
      bookingId: newBooking.bookingId,
      paymentAmount: bookingPayload.paymentAmount,
      pendingAmount: bookingPayload.unitPrice - bookingPayload.downPayment,
      paymentMethod: bookingPayload.paymentMethod,
      paymentProof: bookingPayload.paymentProof || 'receipt_attached.pdf',
      dateAndTime: new Date().toISOString(),
      downPayment: bookingPayload.downPayment,
      numOfMonthsForPay: bookingPayload.months || 36,
      status: 'Verification Pending'
    };

    setBookings((prev) => [newBooking, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);

    await updateUnitStatus(bookingPayload.unitId, 'Reserved');

    return newBooking;
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const target = bookings.find(b => b.bookingId === bookingId || b.id === bookingId);
      if (target && target.id) {
        await bookingsApi.updateStatus(target.id, status);
      }
    } catch (err) {
      throw err;
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === bookingId || b.id === bookingId) {
          if (status === 'Approved') {
            updateUnitStatus(b.unitId, 'Sold');
          } else if (status === 'Rejected') {
            updateUnitStatus(b.unitId, 'Available');
          }
          return { ...b, status };
        }
        return b;
      })
    );
  };

  const updateUnitStatus = async (unitId, newStatus) => {
    try {
      await unitsApi.updateStatus(unitId, newStatus);
    } catch (err) {
      throw err;
    }

    setUnits((prev) =>
      prev.map((u) => (u.unitId === unitId ? { ...u, avilability: newStatus, availability: newStatus } : u))
    );
  };

  const addApartment = async (apartmentData) => {
    const newApartment = await apartmentsApi.create(apartmentData);
    setApartments((prev) => [...prev, newApartment]);
    return newApartment;
  };

  const addUnit = async (unitData) => {
    const createdUnit = await unitsApi.create(unitData);
    const newUnit = {
      ...createdUnit,
      avilability: createdUnit.availability || 'Available'
    };

    setUnits((prev) => [...prev, newUnit]);
    return newUnit;
  };

  const addPromotion = async (promoData) => {
    const newPromo = await promotionsApi.create(promoData);
    setPromotions((prev) => [newPromo, ...prev]);
    return newPromo;
  };

  const addExternalApartment = async (exData) => {
    const newEx = await externalApartmentsApi.create(exData);
    setExternalApartments((prev) => [newEx, ...prev]);
    return newEx;
  };

  return (
    <StoreContext.Provider
      value={{
        apartments,
        units,
        externalApartments,
        promotions,
        bookings,
        payments,
        isBackendConnected,
        createBooking,
        updateBookingStatus,
        updateUnitStatus,
        addApartment,
        addUnit,
        addPromotion,
        addExternalApartment
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
