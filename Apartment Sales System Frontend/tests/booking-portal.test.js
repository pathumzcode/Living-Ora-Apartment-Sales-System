import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { addEventListener() {} };
globalThis.fetch = async () => new Response('[]', { status: 200 });
const { belongsToCustomer } = await import('../js/pages/customer-dashboard.js');
const { bookingsApi } = await import('../js/api.js');
const { store } = await import('../js/store.js');
await store.ready;

test('customer matching excludes missing identities and other customers', () => {
  assert.equal(belongsToCustomer({}, {}), false);
  assert.equal(belongsToCustomer({ userEmail: 'other@example.com' }, { email: 'client@example.com' }), false);
  assert.equal(belongsToCustomer({ userEmail: 'CLIENT@example.com' }, { email: 'client@example.com' }), true);
  assert.equal(belongsToCustomer({ uid: 'USR-1' }, { uid: 'USR-1' }), true);
});

test('booking requests use numeric ID routes and accept empty delete responses', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    return options.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json({ id: 42 });
  };
  await bookingsApi.getById(42);
  await bookingsApi.update(42, { bookingDate: '2026-09-26', expireDate: '2026-10-01', additions: 'Parking' });
  await bookingsApi.delete(42);
  assert.ok(calls.every(call => call.url.endsWith('/bookings/42')));
  assert.equal(calls[1].method, 'PUT');
  assert.equal(JSON.parse(calls[1].body).additions, 'Parking');
  assert.equal(calls[2].method, 'DELETE');
});

test('failed updates and deletes preserve the booking and surface the server error', async () => {
  store.bookings = [{ id: 42, additions: 'Original' }];
  globalThis.fetch = async () => Response.json({ message: 'Approved bookings cannot be changed' }, { status: 400 });
  await assert.rejects(store.updateBooking(42, { additions: 'Changed' }), /Approved bookings/);
  await assert.rejects(store.deleteBooking(42), /Approved bookings/);
  assert.deepEqual(store.bookings, [{ id: 42, additions: 'Original' }]);
});

test('successful updates replace the cached booking with the server response', async () => {
  globalThis.fetch = async () => Response.json({ id: 42, additions: 'Parking' });
  await store.updateBooking(42, { additions: 'Parking' });
  assert.deepEqual(store.bookings, [{ id: 42, additions: 'Parking' }]);
});
