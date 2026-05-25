let expenses = [];
let editMode = false;
let editId = null;
let chart = null;

const nameInput = document.getElementById('expenseName');
const amountInput = document.getElementById('expenseAmount');
const categorySelect = document.getElementById('expenseCategory');
const addBtn = document.getElementById('addBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterSelect = document.getElementById('filterCategory');
const expenseListEl = document.getElementById('expenseList');
const totalSpan = document.getElementById('total');

function generateId() { return Date.now() + Math.floor(Math.random() * 10000); }

function loadExpenses() {
    const stored = localStorage.getItem('sdd_expenses');
    if (stored) {
        expenses = JSON.parse(stored);
        if (expenses.length && !expenses[0].id) {
            expenses = expenses.map(e => ({ ...e, id: generateId() }));
            saveExpenses();
        }
    }
    render();
}

function saveExpenses() { localStorage.setItem('sdd_expenses', JSON.stringify(expenses)); }

function addOrUpdate() {
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    if (name === '' || isNaN(amount) || amount <= 0) {
        alert('Please enter valid name and positive amount.');
        return;
    }
    if (editMode && editId !== null) {
        const index = expenses.findIndex(e => e.id === editId);
        if (index !== -1) expenses[index] = { id: editId, name, amount, category };
        editMode = false;
        editId = null;
        addBtn.textContent = 'Add Expense';
    } else {
        expenses.push({ id: generateId(), name, amount, category });
    }
    nameInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'Food';
    saveExpenses();
    render();
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses();
    render();
}

function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    nameInput.value = expense.name;
    amountInput.value = expense.amount;
    categorySelect.value = expense.category;
    editMode = true;
    editId = id;
    addBtn.textContent = 'Update Expense';
}

function clearAll() {
    if (confirm('Delete all expenses?')) {
        expenses = [];
        saveExpenses();
        render();
    }
}

function getFilteredExpenses() {
    const filter = filterSelect.value;
    if (filter === 'all') return expenses;
    return expenses.filter(e => e.category === filter);
}

function calculateTotal() {
    return getFilteredExpenses().reduce((sum, e) => sum + e.amount, 0);
}

function updateChart() {
    const categories = ['Food', 'Transport', 'Supplies', 'Entertainment', 'Other'];
    const filtered = getFilteredExpenses();
    const totals = categories.map(cat =>
        filtered.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    );
    if (chart) chart.destroy();
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: totals,
                backgroundColor: ['#ff6384','#36a2eb','#ffce56','#4bc0c0','#9966ff']
            }]
        },
        options: { responsive: true }
    });
}

function render() {
    const filtered = getFilteredExpenses();
    expenseListEl.innerHTML = '';
    filtered.forEach(exp => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `
            <div class="expense-info">
                <span class="expense-name">${escapeHtml(exp.name)}</span>
                <span class="expense-category">${exp.category}</span>
                <span class="expense-amount">₹${exp.amount.toFixed(2)}</span>
            </div>
            <div class="actions">
                <button class="edit-btn" data-id="${exp.id}">✏️ Edit</button>
                <button class="delete-btn" data-id="${exp.id}">🗑️ Delete</button>
            </div>
        `;
        expenseListEl.appendChild(li);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editExpense(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteExpense(parseInt(btn.dataset.id)));
    });
    totalSpan.textContent = calculateTotal().toFixed(2);
    updateChart();
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

addBtn.addEventListener('click', addOrUpdate);
clearAllBtn.addEventListener('click', clearAll);
filterSelect.addEventListener('change', () => render());
loadExpenses();