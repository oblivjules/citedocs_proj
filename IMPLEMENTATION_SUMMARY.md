# Request Status Update Implementation Summary

## Overview
Implemented a comprehensive status update system that automatically logs status changes in the database when registrars update document requests, with UI enhancements for request details and locking mechanisms.

## Backend Changes

### 1. **RequestsService.java**
- **Added dependency injection** for `RequestStatusLogRepository` in constructor
- **Enhanced `update()` method** to handle the new `dateReady` field from `RequestsEntity`
- **New `updateStatus()` method** that:
  - Updates request status and captures `dateReady` timestamp
  - Automatically creates a `RequestStatusLogEntity` entry to log status changes
  - Records old status, new status, and the user who made the change
  - Saves both the updated request and the log entry in a transactional manner

### 2. **RequestsController.java**
- **New endpoint** `PUT /api/requests/{id}/status` 
- Delegates to the new `updateStatus()` service method
- Ensures status changes are properly logged in the database

### 3. **RequestsEntity.java** (Already had)
- Contains `dateReady` field to track when documents are ready for pickup
- Automatically set when status is updated to processing/completed

## Frontend Changes

### 1. **requests.js (API)**
- **Updated `updateRequestStatus()` function** to:
  - Use `PUT` method instead of `PATCH`
  - Automatically include current timestamp as `dateReady`
  - Send proper JSON payload with status and dateReady

### 2. **RequestDetailsModal.jsx**
Enhanced UI with:
- **Request ID display** for better tracking
- **Status color coding** with visual badges
- **Date Ready field** showing when documents will be available
- **Request locking mechanism**:
  - Shows lock icon (🔒) when request is no longer in "pending" status
  - Visual warning that indicates requests cannot be edited once processed
  - Only status changes are allowed for locked requests
- **Improved form styling**:
  - Better formatted textarea for remarks
  - Cancel button to close without changes
  - Loading state indicator during update
- **Better visual hierarchy** with styled status badges

### 3. **RequestTable.jsx**
- **New "Date Ready" column** displaying:
  - Formatted date when `dateReady` is populated
  - Empty state (—) when not yet set
- **Updated table header** with additional column
- **Fixed colspan** in empty state row to match new column count

## Database Schema Impact

### request_status_log Table
When a registrar updates a request status, the following is automatically logged:
```
{
  logId: Auto-incremented ID
  requestId: The request being updated
  oldStatus: Previous status (PENDING/PROCESSING/APPROVED/COMPLETED/REJECTED)
  newStatus: New status (PENDING/PROCESSING/APPROVED/COMPLETED/REJECTED)
  changedBy: User ID of the registrar who made the change
  changedAt: Timestamp of the change (auto-set to current time)
}
```

## User Flow

1. **Registrar views request** in RegistrarPortal
2. **Clicks "Update" button** to open RequestDetailsModal
3. **Updates status** (PENDING → PROCESSING → APPROVED → COMPLETED)
4. **Sets remarks** if needed
5. **Clicks "Update Status"**
   - `dateReady` is automatically set to current timestamp
   - Request status is updated in database
   - Status change is logged in `request_status_log` table
6. **Request becomes locked** preventing further edits (except status changes)
7. **Student can view** updated status and can generate claim slip once APPROVED/COMPLETED

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/requests` | Create new request |
| GET | `/api/requests` | Get all requests (with optional userId filter) |
| GET | `/api/requests/{id}` | Get specific request |
| PUT | `/api/requests/{id}` | Update full request details |
| **PUT** | **`/api/requests/{id}/status`** | **Update status with logging** |
| DELETE | `/api/requests/{id}` | Delete request |
| GET | `/api/request-status-logs` | Get all status logs (with optional userId filter) |

## Testing Checklist

- [ ] Build backend with `mvnw clean compile`
- [ ] Run Spring Boot application
- [ ] Test updating a request status from PENDING to PROCESSING
- [ ] Verify status change is logged in `request_status_log` table
- [ ] Check that `dateReady` is populated in requests table
- [ ] Verify locked request UI displays correctly
- [ ] Test filtering requests by status
- [ ] Verify Date Ready column displays correctly in table
- [ ] Test student can view updated status in StudentPortal
- [ ] Test claim slip generation works for APPROVED/COMPLETED requests

## Future Enhancements

1. Add user authentication to capture actual registrar ID (currently uses userId)
2. Add email notification when status changes
3. Add batch status updates
4. Create audit trail visualization
5. Add status change reasons/explanations
6. Implement status rollback capability
