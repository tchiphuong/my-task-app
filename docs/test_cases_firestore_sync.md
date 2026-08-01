# Test Suite: Cloud Sync & Data Persistence

**Document ID**: QA-TS-003  
**Module**: Firebase Integration & State Persist  
**Objective**: Validate the robustness of the offline-first architecture, real-time Firestore synchronization, and data integrity across sessions.

---

## Test Case: SYNC-01 | Real-time Data Propagation

**Priority**: Critical  
**Pre-conditions**: Application is authenticated and connected to Firestore.

- **Step 1**: Initiate a state mutation (e.g., creating a task or checking in a habit).
- **Step 2**: Observe the local UI update (optimistic UI).
- **Step 3**: Verify the data payload is correctly transmitted and structured within the Firestore backend.
- **Expected Result**:
    - The local state updates instantaneously.
    - The Firestore database accurately mirrors the local state mutation within 2000ms.

## Test Case: SYNC-02 | Cold Start & Data Hydration

**Priority**: Critical  
**Pre-conditions**: Existing data is present in the Firestore backend.

- **Step 1**: Terminate the application instance.
- **Step 2**: Initiate a hard reload (`Ctrl+F5`) to bypass memory caching.
- **Expected Result**:
    - The application hydrates the initial state from the local storage `Zustand persist` cache instantly.
    - A background fetch validates and resolves any data discrepancies with Firestore silently.

## Test Case: SYNC-03 | Incognito Session Validation (Cache Bypass)

**Priority**: High  
**Pre-conditions**: Target account has existing data.

- **Step 1**: Launch the application in a strictly isolated environment (e.g., Incognito Mode or a different browser).
- **Step 2**: Authenticate using the target account credentials.
- **Expected Result**:
    - The application successfully bypasses local storage constraints.
    - All historical tasks, habits, and check-in records are comprehensively restored from the cloud.

## Test Case: SYNC-04 | LocalStorage Purge Resilience

**Priority**: Medium  
**Pre-conditions**: The user is authenticated on a populated account.

- **Step 1**: Manually purge all application data (`localStorage.clear()`, `sessionStorage.clear()`).
- **Step 2**: Refresh the application.
- **Expected Result**:
    - The application may briefly display an empty state or loading skeleton.
    - The Firestore sync protocol activates, fully restoring the user's data payload without data loss.
