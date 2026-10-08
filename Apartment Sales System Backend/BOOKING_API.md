# Booking API

All paths are relative to `/api/bookings`. `{id}` is the numeric database ID returned in the booking response, not the `BKG-...` reference.

| Method | Path | Operation | Success |
| --- | --- | --- | --- |
| GET | / | List bookings | 200 |
| GET | /{id} | View one booking, including payment amount and proof | 200 |
| POST | / | Create a reservation using the existing BookingRequest | 201 |
| PUT | /{id} | Replace booking dates and additions | 200 |
| PATCH | /{id}/status?status=Approved | Change status using the existing workflow | 200 |
| DELETE | /{id} | Delete a booking and its unverified payment records | 204 |

Example PUT body:

```json
{
  "bookingDate": "2026-09-26",
  "expireDate": "2026-10-11",
  "additions": "Parking"
}
```

Both dates are required. Expiry must be on or after the booking date. Additions are optional (null or omitted clears them), with a maximum of 45 characters. Booking reference, customer, unit, payment details, and status are preserved by PUT; status changes use the PATCH endpoint.

Missing bookings return 404. Invalid updates return 400. Approved bookings cannot be updated or deleted through these endpoints, and bookings with verified payments cannot be deleted. Deletion releases a reserved unit only when no other active booking uses it; sold units remain sold. Booking deletion, payment cleanup, and unit availability changes run in one transaction.
