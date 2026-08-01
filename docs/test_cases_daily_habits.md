# Test Suite: Daily Habits Tracking Module

**Document ID**: QA-TS-002  
**Module**: Daily Page (`/daily`)  
**Objective**: Validate the creation, progression, and streak calculation algorithms of the daily habits tracking system.

---

## Test Case: HAB-01 | Create Daily Habit

**Priority**: High  
**Pre-conditions**: User is navigated to the `/daily` page.

- **Step 1**: Locate the "Thêm thói quen mới" (Add New Habit) module.
- **Step 2**: Input a valid habit title (e.g., "Read 20 pages").
- **Step 3**: Submit the creation form.
- **Expected Result**:
    - The new habit is instantly appended to the habit list grid.
    - The form input is reset upon successful submission.

## Test Case: HAB-02 | Execute Daily Check-in

**Priority**: High  
**Pre-conditions**: A daily habit exists in the system.

- **Step 1**: Locate the targeted habit in the list.
- **Step 2**: Toggle the check-in button corresponding to the current date.
- **Expected Result**:
    - The UI updates to reflect the completed state (icon transition, success color scheme).
    - The global daily progress bar increments proportionally.

## Test Case: HAB-03 | Streak Calculation & Visualization

**Priority**: Critical  
**Pre-conditions**: A habit has historical check-in data.

- **Step 1**: Observe the "Kỷ luật liên tục" (Current Streak) and "Kỷ lục tốt nhất" (Best Streak) metrics on the dashboard.
- **Step 2**: Check-in a habit for the current date.
- **Expected Result**:
    - The "Current Streak" metric increments accurately.
    - The 7-day lookback calendar updates the completion ratio for the current day (e.g., `1/5` -> `2/5`).

## Test Case: HAB-04 | Habit Deletion Protocol

**Priority**: High  
**Pre-conditions**: A habit exists in the system.

- **Step 1**: Trigger the deletion action on a specific habit card.
- **Step 2**: Confirm the destructive action via the safety modal.
- **Expected Result**:
    - The habit and all its associated historical check-in data are permanently purged.
    - The progress metrics recalibrate instantly to reflect the updated dataset.
