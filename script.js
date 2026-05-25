let expenses = [];
let currentEditId = null;
let chart;

const nameInp = document.getElementById('expenseName');
const amountInp = document.getElementById('expenseAmount');
const catSelect = document.getElementById('expenseCategory');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearAllBtn');
const filterSelect = document.getElementById('filterCategory');
const expenseList = document.getElementById('expenseList');
const totalSpan = document.getElementById('total');

function generateId() { return Date.now() + Math.random() * 10000; }

function load() {
    const saved = localStorage.getItem('vibe_expenses');
    if (saved) expenses = JSON.parse(saved);
    render();
}
function save() { localStorage.setItem('vibe_expenses', JSON.stringify(expenses)); }

function addOrUpdate() {
    let name = nameInp.value.trim();
    let amount = parseFloat(amountInp.value);
    let cat = catSelect.value;
    if (!name || isNaN(amount) || amount <= 0) {
        alert("Valid name and positive amount required");
        return;
    }
    if (currentEditId !== null) {
        let idx = expenses.findIndex(e => e.id === currentEditId);
        if (idx !== -1) expenses[idx] = { id: currentEditId, name, amount, category: cat };
        currentEditId = null;
        addBtn.innerText = 'Add Expense';
    } else {
        expenses.push({ id: generateId(), name, amount, category: cat });
    }
    nameInp.value = '';
    amountInp.value = '';
    catSelect.value = 'Food';
    save();
    render();
}

function delExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    save();
    render();
}

function editExpense(id) {
    let exp = expenses.find(e => e.id === id);
    if (exp) {
        nameInp.value = exp.name;
        amountInp.value = exp.amount;
        catSelect.value = exp.category;
        currentEditId = id;
        addBtn.innerText = 'Update Expense';
    }
}

function clearAll() {
    if (confirm("Delete all expenses?")) {
        expenses = [];
        save();
        render();
    }
}

function getFiltered() {
    let filter = filterSelect.value;
    if (filter === 'all') return expenses;
    return expenses.filter(e => e.category === filter);
}

function updateTotal() {
    let total = getFiltered().reduce((s, e) => s + e.amount, 0);
    totalSpan.innerText = total.toFixed(2);
}

function updateChart() {
    let categories = ['Food', 'Transport', 'Supplies', 'Entertainment', 'Other'];
    let filtered = getFiltered();
    let data = categories.map(c => filtered.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0));
    if (chart) chart.destroy();
    let ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: { labels: categories, datasets: [{ data, backgroundColor: ['#ff6384','#36a2eb','#ffce56','#4bc0c0','#9966ff'] }] },
        options: { responsive: true }
    });
}

function render() {
    let filtered = getFiltered();
    expenseList.innerHTML = '';
    filtered.forEach(exp => {
        let li = document.createElement('li');
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
        expenseList.appendChild(li);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editExpense(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => delExpense(parseInt(btn.dataset.id)));
    });
    updateTotal();
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
clearBtn.addEventListener('click', clearAll);
filterSelect.addEventListener('change', render);
load();