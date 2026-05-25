# Specification: Student Expense Calculator (SDD Version)

## 1. Core Requirements
- Input fields: expense name, amount (positive number), category (Food, Transport, Supplies, Entertainment, Other).
- Button "Add Expense" to add entry.
- Display list of expenses with name, amount, category, edit and delete buttons.
- Display total spent.
- Data persists using localStorage.
- Responsive design.

## 2. Functional Rules
- **Add**: If name empty or amount ≤0, show alert.
- **Edit**: Populate form, change button to "Update".
- **Delete**: Remove expense and update total.
- **Clear All**: Remove all after confirmation.
- **Filter**: Dropdown to filter by category.
- **Chart**: Pie chart (Chart.js) that updates when expenses change.

## 3. Data Model
Each expense: `{ id, name, amount, category }`

## 4. Non-Functional Requirements
- HTML, CSS, plain JavaScript, Chart.js CDN.
- Clean UI with gradient background.
- Chart handles empty state gracefully.