# Implementation Status

This document tracks the implementation status of features defined in the [Design Specification](design-spec.yaml) and [Execution Workflow](execution-workflow.yaml).

## Feature Status Summary

| ID | Feature Name | Status | Notes |
|:---|:---|:---:|:---|
| `f_new_user` | New User Registration | **Partial** | `onMemberSignup` implemented with Birthday/Anniversary events and dropdown sync. Validation for duplicate emails is missing. |
| `f_new_user_payment` | New User Payment | **Implemented** | `onPaymentSubmit` calculates expiry and creates calendar events. |
| `f_admin_initial_schedule` | Initial Schedule Assignment | **Missing** | No handler or logic implemented in the codebase yet. |
| `f_admin_attendance` | Class Attendance | **Missing (Spec Ready)** | Form specification and configuration added. Handler logic not yet implemented. |
| `f_admin_modify_schedule` | Modify User Schedule | **Missing (Spec Ready)** | Form specification and configuration added. Handler logic not yet implemented. |
| `d_upcoming_schedules` | Upcoming Enrollments Dashboard | **Missing (Spec Ready)** | Specification for Google Sheets-based view of enrollments. |
| `d_member_status` | Member Status Dashboard | **Missing (Spec Ready)** | Specification for membership health and credit usage overview. |
| `d_availability` | Availability Dashboard | **Missing (Spec Ready)** | Specification for capacity and heatmap analysis. |
| `f_date_parsing` | Flexible Date Parsing | **Implemented** | Handled within specific handlers using regex splitters. |

---

## Technical Audit Details

### 1. New User Registration (`f_new_user`)
- **Implemented Functions**:
  - `masterFormRouter(e)` in `routers.js`
  - `onMemberSignup(e)` in `handlers.js`
  - `updateMemberDropdown()` in `functions.js`
  - `getFieldValue()` in `utils.js`
- **Gaps**:
  - Missing duplicate email check.
  - Yearly Birthday events are scheduled starting from the current year, which might need adjustment based on the actual birth year if needed (currently sets to `today.getFullYear()`).

### 2. New User Payment (`f_new_user_payment`)
- **Implemented Functions**:
  - `onPaymentSubmit(e)` in `handlers.js`
  - `toSlug()` in `utils.js` (for membership type normalization)
- **Status**: Matches specification.

### 3. Flexible Date Parsing (`f_date_parsing`)
- **Implementation**: Inline logic in `handlers.js` using `split(/[-/.]/)`.
- **Status**: Robust enough for standard D/M/Y or D/M inputs.

### 4. Missing Administration Features
The following administration-focused features from the spec are not yet present in the `src/` directory:
- `f_admin_initial_schedule` (`onScheduleSubmit`, `checkCapacity`)
- `f_admin_attendance` (`onAttendanceSubmit`, `deductCredits`) - **Spec Ready**
- `f_admin_modify_schedule` (`onModifyScheduleSubmit`) - **Spec Ready**

### 5. Dashboards (`dashboards-spec.yaml`)
- `d_upcoming_schedules`: **Spec Ready** (Sheets-only)
- `d_member_status`: **Spec Ready** (Sheets-only)
- `d_availability`: **Spec Ready** (Sheets-only)

## Execution Workflow Status
- **Router**: `masterFormRouter` is fully implemented and correctly delegates to Payments and Users handlers.
- **Routes**:
  - `CONFIG.PAYMENTS.SHEET_NAME` -> `onPaymentSubmit` (**Active**)
  - `CONFIG.USERS.SHEET_NAME` -> `onMemberSignup` (**Active**)
  - `Default` -> Warning log (**Active**)
