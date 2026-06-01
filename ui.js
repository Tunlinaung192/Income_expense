// ui.js - User Interface Rendering
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

    transactions.forEach(t => {
        let amt = parseFloat(t.amount);
        const li = document.createElement('li');
        li.className = t.type === "ဝင်ငွေ" ? "list-inc" : "list-exp";
        
        li.innerHTML = `
            <div class="list-details">
                <strong>${t.description}</strong><small>(${t.method === "Cash" ? "ငွေသား" : t.bankName})</small><br>
                <span class="list-time">📅 ${t.date} | ⏰ ${t.time}</span>
            </div>
            <div class="list-action">
                <span class="list-amt">${t.type === "ဝင်ငွေ" ? "+" : "-"}${amt.toLocaleString()} ကျပ်</span>
                <button onclick="deleteTransaction('${t.id}')">❌</button>
            </div>`;
        list.appendChild(li);
    });
}

function toggleBankNameInput() {
    const method = document.getElementById('method').value;
    document.getElementById('bank-select').style.display = (method === "Cash") ? "none" : "block";
}
function toggleCustomBankInput() {
    const bankSelect = document.getElementById('bank-select').value;
    document.getElementById('custom-bank-name').style.display = (bankSelect === "Other") ? "block" : "none";
}
