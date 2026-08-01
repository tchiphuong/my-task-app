# Test Suite: Task Management Module

**Document ID**: QA-TS-001  
**Module**: Tasks Page (`/tasks`)  
**Objective**: Validate the core functionality, state transitions, and UI responsiveness of the task management module.

---

## Test Case: TSK-01 | Create New Task

**Priority**: High  
**Pre-conditions**: User is navigated to the `/tasks` page.

- **Step 1**: Initialize task creation by clicking the "Thêm việc" (Add Task) button.
- **Step 2**: Populate the creation form with valid data (Title, Description, Priority, Due Date, Category).
- **Step 3**: Submit the form by clicking "Tạo công việc".
- **Expected Result**:
    - The modal closes without errors.
    - The new task is immediately rendered in the "Todo" (Cần làm) column of the Kanban board.
    - A success toast notification is displayed.

## Test Case: TSK-02 | Edit Existing Task

**Priority**: Medium  
**Pre-conditions**: At least one task exists in the Kanban board.

- **Step 1**: Locate an existing task card and trigger the context menu (Ellipsis icon).
- **Step 2**: Select the "Chỉnh sửa" (Edit) action.
- **Step 3**: Modify the task's title and priority.
- **Step 4**: Commit the changes by clicking "Lưu thay đổi".
- **Expected Result**:
    - The task card instantly reflects the updated title and priority state.
    - No page reload is required (optimistic UI update).

## Test Case: TSK-03 | State Transition (Kanban Flow)

**Priority**: High  
**Pre-conditions**: A task exists in the "Todo" state.

- **Step 1**: Trigger the "Bắt đầu làm" (Start) action on a Todo task.
- **Step 2**: Observe the task's relocation to the "In Progress" column.
- **Step 3**: Trigger the "Hoàn thành" (Complete) action on the same task.
- **Expected Result**:
    - Column item counts update accurately.
    - The task is successfully relocated to the "Done" column.
    - Visual styling updates (strikethrough text, color desaturation) apply automatically.

## Test Case: TSK-04 | Advanced Filtering & Search

**Priority**: Medium  
**Pre-conditions**: Multiple tasks exist with varying categories and priorities.

- **Step 1**: Input a valid keyword into the search bar.
- **Step 2**: Clear the search input.
- **Step 3**: Apply a Category filter via the dropdown.
- **Step 4**: Apply a Priority filter (e.g., "High").
- **Expected Result**:
    - The Kanban board dynamically filters the rendered tasks matching the intersection of all active criteria.
    - Filtering operations are instantaneous without UI stuttering.

## Test Case: TSK-05 | Delete Task Validation

**Priority**: High  
**Pre-conditions**: A task exists in the Kanban board.

- **Step 1**: Trigger the "Xóa công việc" (Delete) action via the context menu.
- **Step 2**: Acknowledge the destructive action in the Confirm Modal.
- **Expected Result**:
    - The task is permanently removed from the state and the UI.
    - The global task count is decremented accordingly.
