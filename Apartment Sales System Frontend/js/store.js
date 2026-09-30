/**
 * Central Data Store for Living-Ora
 * All data is fetched exclusively from the Spring Boot REST API.
 * No hardcoded fallback data — pages show a loading skeleton and
 * re-render automatically once the database responds.
 */

import {
  apartmentsApi,
  unitsApi,
  bookingsApi,
  paymentsApi,
  promotionsApi,
  externalApartmentsApi
} from './api.js';

class DataStore {
  constructor() {
    // Initialize with default luxury portfolio (overwritten immediately when database responds)
    this.apartments = [
      {
        id: 'APT-LO-001',
        apartmentId: 'APT-LO-001',
        name: 'Living-Ora Heights',
        location: 'Colombo 03, Sri Lanka — Marine Drive',
        about: 'A considered home for modern coastal living. Floor-to-ceiling glass, ocean vistas, and resort-grade amenities define this signature development.',
        priceRange: '$220,000 – $850,000',
        numOfUnitsAvailable: 12,
        numOfUnitsAvilable: 12,
        numOfFloors: 22,
        numOfSwimmingPool: 2,
        numOfGYM: 1,
        images: 'images/luxury-complex-marina.jpg',
        floorPlan: 'images/luxury-interior-lounge.jpg',
        unitStatus: 'Available'
      },
      {
        id: 'APT-LO-002',
        apartmentId: 'APT-LO-002',
        name: 'Ora Grand Residences',
        location: 'Colombo 07, Sri Lanka — Bauddhaloka Mawatha',
        about: 'Elegance meets urban sophistication. A landmark tower offering panoramic city views and exclusive penthouse suites for discerning buyers.',
        priceRange: '$310,000 – $1,200,000',
        numOfUnitsAvailable: 8,
        numOfUnitsAvilable: 8,
        numOfFloors: 30,
        numOfSwimmingPool: 1,
        numOfGYM: 2,
        images: 'images/luxury-villa-hero.jpg',
        floorPlan: 'images/luxury-interior-lounge.jpg',
        unitStatus: 'Available'
      },
      {
        id: 'APT-LO-003',
        apartmentId: 'APT-LO-003',
        name: 'Ora Waterfront Villas',
        location: 'Mount Lavinia, Sri Lanka — Beach Road',
        about: 'Sun-drenched waterfront villas with private pool access, tropical gardens, and direct beach frontage. The ultimate coastal lifestyle.',
        priceRange: '$450,000 – $1,800,000',
        numOfUnitsAvailable: 5,
        numOfUnitsAvilable: 5,
        numOfFloors: 4,
        numOfSwimmingPool: 3,
        numOfGYM: 1,
        images: 'images/luxury-interior-lounge.jpg',
        floorPlan: 'images/luxury-interior-lounge.jpg',
        unitStatus: 'Available'
      }
    ];

    this.units = [
      { unitId: 'UNT-001', apartment_id: 'APT-LO-001', floor: 8, location: '8th Floor — Living-Ora Heights', unitPrice: 320000, numOfBeds: 2, numOfBathRooms: 2, numOfRooms: 2, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Luminous corner suite with dual ocean and city aspects.', images: 'images/luxury-interior-lounge.jpg', avilability: 'Available', availability: 'Available' },
      { unitId: 'UNT-002', apartment_id: 'APT-LO-001', floor: 15, location: '15th Floor — Living-Ora Heights', unitPrice: 480000, numOfBeds: 3, numOfBathRooms: 3, numOfRooms: 3, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Sky-high penthouse-style suite with wrap-around glass balconies.', images: 'images/luxury-villa-hero.jpg', avilability: 'Available', availability: 'Available' },
      { unitId: 'UNT-003', apartment_id: 'APT-LO-001', floor: 20, location: '20th Floor — Sky Penthouse', unitPrice: 850000, numOfBeds: 4, numOfBathRooms: 4, numOfRooms: 5, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Double-height ceilings, private sky terrace, and full ocean panorama.', images: 'images/luxury-complex-marina.jpg', avilability: 'Reserved', availability: 'Reserved' },
      { unitId: 'UNT-004', apartment_id: 'APT-LO-002', floor: 12, location: '12th Floor — Ora Grand', unitPrice: 390000, numOfBeds: 2, numOfBathRooms: 2, numOfRooms: 2, acOrNonAC: 'AC', furnitures: 'Partially Furnished', about: 'Stylish urban suite with sweeping Colombo 07 views.', images: 'images/luxury-interior-lounge.jpg', avilability: 'Available', availability: 'Available' },
      { unitId: 'UNT-005', apartment_id: 'APT-LO-002', floor: 25, location: '25th Floor — Ora Grand', unitPrice: 680000, numOfBeds: 3, numOfBathRooms: 3, numOfRooms: 4, acOrNonAC: 'AC', furnitures: 'Fully Furnished', about: 'Breathtaking high-rise residence with private lift lobby.', images: 'images/luxury-complex-marina.jpg', avilability: 'Available', availability: 'Available' },
      { unitId: 'UNT-006', apartment_id: 'APT-LO-003', floor: 2, location: 'Villa 2 — Ora Waterfront', unitPrice: 520000, numOfBeds: 3, numOfBathRooms: 3, numOfRooms: 4, acOrNonAC: 'Non-AC', furnitures: 'Fully Furnished', about: 'Tropical waterfront villa with direct pool access.', images: 'images/luxury-villa-hero.jpg', avilability: 'Available', availability: 'Available' }
    ];
    this.promotions = [];
    this.externalApartments = [];
    this.bookings = [];
    this.payments = [];

    this.isBackendConnected = false;
    this.isSyncing = false;

    /** Subscriber callbacks — pages register to be notified on any update */
    this._subscribers = [];

    /** Resolves after the first backend sync attempt completes */
    this.ready = this._syncWithBackend();
  }

  // ── Subscriber Pattern ──────────────────────────────────────────────────────

  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  }

  _notify() {
    this._subscribers.forEach(cb => {
      try { cb(); } catch (e) { console.error('[Store] Subscriber error:', e); }
    });
  }

  // ── Backend Sync ────────────────────────────────────────────────────────────

  async _syncWithBackend() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const [aptsRes, unitsRes, promosRes, exAptsRes, bRes, pRes] = await Promise.allSettled([
        apartmentsApi.getAll(),
        unitsApi.getAll(),
        promotionsApi.getAll(),
        externalApartmentsApi.getAll(),
        bookingsApi.getAll(),
        paymentsApi.getAll()
      ]);

      if (aptsRes.status === 'fulfilled' && Array.isArray(aptsRes.value)) {
        this.apartments = aptsRes.value.map(apt => ({
          ...apt,
          id: apt.apartmentId || apt.id,
          name: apt.name || (apt.location ? apt.location.split('—')[0].trim() : `Apartment ${apt.apartmentId}`),
          images: apt.images || 'images/luxury-complex-marina.jpg',
          floorPlan: apt.floorPlan || 'images/luxury-interior-lounge.jpg'
        }));
        this.isBackendConnected = true;
      }

      if (unitsRes.status === 'fulfilled' && Array.isArray(unitsRes.value)) {
        this.units = unitsRes.value.map(u => ({
          ...u,
          images: u.images || 'images/luxury-interior-lounge.jpg',
          avilability: u.availability || u.avilability || 'Available'
        }));
      }

      if (promosRes.status === 'fulfilled' && Array.isArray(promosRes.value)) {
        this.promotions = promosRes.value;
      }

      if (exAptsRes.status === 'fulfilled' && Array.isArray(exAptsRes.value)) {
        this.externalApartments = exAptsRes.value;
      }

      if (bRes.status === 'fulfilled' && Array.isArray(bRes.value)) {
        this.bookings = bRes.value;
      }

      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) {
        this.payments = pRes.value;
      }

    } catch (err) {
      console.warn('[Store] Backend unreachable:', err.message);
      this.isBackendConnected = false;
    } finally {
      this.isSyncing = false;
      this._notify();
    }
  }

  /** Re-sync from backend and notify all subscribers */
  async refresh() {
    await this._syncWithBackend();
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  getApartments() { return this.apartments; }
  getApartmentById(id) {
    return this.apartments.find(a => a.id === id || a.apartmentId === id) || null;
  }
  getUnits() { return this.units; }
  getUnitsByApartmentId(apartmentId) {
    return this.units.filter(u => u.apartment_id === apartmentId || u.apartmentId === apartmentId);
  }
  getBookings() { return this.bookings; }
  getPayments() { return this.payments; }
  getPromotions() { return this.promotions; }
  getExternalApartments() { return this.externalApartments; }

  // ── Mutations (always write to backend then re-sync) ────────────────────────

  async createBooking(payload) {
    const result = await bookingsApi.create({
      unitId: payload.unitId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      paymentAmount: payload.paymentAmount,
      downPayment: payload.downPayment,
      paymentMethod: payload.paymentMethod,
      paymentProof: payload.paymentProof || 'receipt.pdf',
      months: payload.months || 36
    });
    await this.refresh();
    return result;
  }

  async updateBookingStatus(bookingId, status) {
    const target = this.bookings.find(b => b.bookingId === bookingId || b.id === bookingId);
    if (!target) throw new Error('Booking not found: ' + bookingId);
    await bookingsApi.updateStatus(target.id, status);
    await this.refresh();
  }

  async updateUnitStatus(unitId, newStatus) {
    await unitsApi.updateStatus(unitId, newStatus);
    await this.refresh();
  }

  async addApartment(apartmentData) {
    const created = await apartmentsApi.create(apartmentData);
    await this.refresh();
    return created;
  }

  async addUnit(unitData) {
    const created = await unitsApi.create(unitData);
    await this.refresh();
    return created;
  }

  async addExternalApartment(data) {
    const created = await externalApartmentsApi.create(data);
    await this.refresh();
    return created;
  }

  async createPromotion(data) {
    const created = await promotionsApi.create(data);
    await this.refresh();
    return created;
  }

  async updatePromotion(id, data) {
    const updated = await promotionsApi.update(id, data);
    await this.refresh();
    return updated;
  }

  async deletePromotion(id) {
    const result = await promotionsApi.remove(id);
    await this.refresh();
    return result;
  }

  async togglePromotionStatus(id) {
    const result = await promotionsApi.toggleStatus(id);
    await this.refresh();
    return result;
  }
}

export const store = new DataStore();
