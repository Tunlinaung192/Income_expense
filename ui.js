// ui.js - Drawing User Interface Table rows & Filters
function render() {
    const list = document.getElementById('transaction-list');
    if (!list) return;
    list.innerHTML = "";
    
    let mainIncome = 0, mainExpense = 0, mainBankingBal = 0, mainCashBal = 0;
    transactions.forEach(t => {
        let amt = parseFloat(t.amount);
        if (t.type === "ဝင်ငွေ") {
            mainIncome += amt; if (t.method === "Banking") mainBankingBal += amt; else mainCashBal += amt;
        } else {
            mainExpense += amt; if (t.method === "Banking") mainBankingBal -= amt; else mainCashBal -= amt;
        }
    });

    document.getElementById('total-income').innerText = mainIncome.toLocaleString() + " ကျပ်";
    document.getElementById('total-expense').innerText = mainExpense.toLocaleString() + " ကျပ်";
    document.getElementById('net-balance').innerText = (mainIncome - mainExpense).toLocaleString() + " ကျပ်";
    document.getElementById('banking-balance').innerText = mainBankingBal.toLocaleString() + " ကျပ်";
    document.getElementById('cash-balance').innerText = mainCashBal.toLocaleString() + " ကျပ်";

    const filterDate = document.getElementById('filter-date').value;
    const filterMethod = document.getElementById('filter-method').value;
    const filterText = document.getElementById('filter-text').value.toLowerCase().trim();

    let filteredIncome = 0, filteredExpense = 0;
    let isFilteringActive = (filterDate  filterMethod !== "All"  filterText);

    transactions.forEach(t => {
        if (filterDate && t.date !== filterDate) return;
        if (filterMethod !== "All") {
            if (filterMethod === "Cash" && t.method !== "Cash") return;
            if (filterMethod === "Banking_Other" && (t.method !== "Banking" || ["Kpay", "Wavepay", "AYAPay", "CBPay", "KBZ Bank", "CB Bank", "AYA Bank"].includes(t.bankName))) return;
            if (filterMethod !== "Cash" && filterMethod !== "Banking_Other" && t.bankName !== filterMethod) return;
        }
        if (filterText && !t.description.toLowerCase().includes(filterText)) return;

        let amt = parseFloat(t.amount);
        if (t.type === "ဝင်ငွေ") filteredIncome += amt; else filteredExpense += amt;

        const li = document.createElement('li');
        li.className = t.type === "ဝင်ငွေ" ? "list-inc" : "list-exp";
        
        let deleteButtonHtml = "";
        if (current_acc_type === "Admin") {
            deleteButtonHtml = <button onclick="deleteTransaction('${t.id}')">❌</button>;
        }

        li.innerHTML = `
            <div class="list-details">
                <strong>${t.description}</strong><small>(${t.method === "Cash" ? "ငွေသား" : t.bankName})</small><br>
                <span class="list-time">📅 ${t.date} | ⏰ ${t.time}</span>
            </div>
            <div class="list-action">
                <span class="list-amt">${t.type === "ဝင်ငွေ" ? "+" : "-"}${amt.toLocaleString()} ကျပ်</span>
                ${deleteButtonHtml}
            </div>`;
        list.appendChild(li);
    });

    const summaryDiv = document.getElementById('filter-summary');
    if (isFilteringActive) {
        summaryDiv.style.display = "block";
        summaryDiv.innerHTML = `
            <strong>🔍 စစ်ထုတ်ထားသော အကျဉ်းချုပ် ရလဒ်-</strong><br>
            📈 ဝင်ငွေစုစုပေါင်း: <span class="text-inc">+${filteredIncome.toLocaleString()} ကျပ်</span><br>
            📉 ထွက်ငွေစုစုပေါင်း: <span class="text-exp">-${filteredExpense.toLocaleString()} ကျပ်</span><br>
            ⚖️ ပြောင်းလဲမှုလက်ကျန်: <strong>${(filteredIncome - filteredExpense).toLocaleString()} ကျပ်</strong>
        `;
    } else {
        summaryDiv.style.display = "none";
    }
}

function clearFilter() {
    document.getElementById('filter-date').value = "";
    document.getElementById('filter-method').value = "All";
    document.getElementById('filter-text').value = "";
    render();
}
function toggleBankNameInput() {
    const method = document.getElementById('method').value;
    document.getElementById('bank-select').style.display = (method === "Cash") ? "none" : "block";
}function toggleCustomBankInput() {
    const bankSelect = document.getElementById('bank-select').value;
    document.getElementById('custom-bank-name').style.display = (bankSelect === "Other") ? "block" : "none";
}