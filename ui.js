// ui.js - User Interface Rendering

function render() {
    const list = document.getElementById('transaction-list');
    if (!list) return;
    list.innerHTML = "";
    
    let mainIncome = 0;
    let mainExpense = 0;
    let mainBankingBal = 0;
    let mainCashBal = 0;

    // စာရင်းများကို ပတ်ပြီး ဝင်ငွေ/ထွက်ငွေ ခွဲခြားတွက်ချက်ခြင်း
    transactions.forEach(t => {
        let amt = parseFloat(t.amount) || 0;
        if (t.type === "ဝင်ငွေ") {
            mainIncome += amt;
            if (t.method === "Banking") {
                mainBankingBal += amt;
            } else {
                mainCashBal += amt;
            }
        } else if (t.type === "ထွက်ငွေ") {
            mainExpense += amt;
            if (t.method === "Banking") {
                mainBankingBal -= amt;
            } else {
                mainCashBal -= amt;
            }
        }
    });

    // 💰 [အဓိကပြင်ဆင်ချက်] HTML ဘက်က ID တွေဆီသို့ ဂဏန်းများ ကွက်တိ ပို့ပေးခြင်း
    const netBalanceElement = document.getElementById('net-balance');
    const totalIncomeElement = document.getElementById('total-income');
    const totalExpenseElement = document.getElementById('total-expense');
    const bankingBalanceElement = document.getElementById('banking-balance');
    const cashBalanceElement = document.getElementById('cash-balance');

    if (netBalanceElement) netBalanceElement.innerText = (mainIncome - mainExpense).toLocaleString() + " ကျပ်";
    if (totalIncomeElement) totalIncomeElement.innerText = mainIncome.toLocaleString() + " ကျပ်";
    if (totalExpenseElement) totalExpenseElement.innerText = mainExpense.toLocaleString() + " ကျပ်";
    if (bankingBalanceElement) bankingBalanceElement.innerText = mainBankingBal.toLocaleString() + " ကျပ်";
    if (cashBalanceElement) cashBalanceElement.innerText = mainCashBal.toLocaleString() + " ကျပ်";

    // စာရင်းမှတ်တမ်းများကို အောက်ခြေဇယားကွက်တွင် တစ်ခုချင်းစီ လိုက်ပြခြင်း
    transactions.forEach(t => {
        let amt = parseFloat(t.amount) || 0;
        const li = document.createElement('li');
        li.className = t.type === "ဝင်ငွေ" ? "list-inc" : "list-exp";
        
        // CSS Style များအတွက် သေသပ်အောင် ပြင်ဆင်ခြင်း
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        li.style.marginBottom = "5px";
        li.style.backgroundColor = t.type === "ဝင်ငွေ" ? "#f4fbf7" : "#fff5f5";
        li.style.borderRadius = "6px";
        
        li.innerHTML = `
            <div class="list-details" style="text-align: left;">
                <strong style="font-size: 15px; color: #2c3e50;">${t.description}</strong> 
                <small style="color: #7f8c8d;">(${t.method === "Cash" ? "ငွေသား" : t.bankName})</small><br>
                <span class="list-time" style="font-size: 11px; color: #95a5a6;">📅 ${t.date} | ⏰ ${t.time}</span>
            </div>
            <div class="list-action" style="display: flex; align-items: center; gap: 10px;">
                <span class="list-amt" style="font-weight: bold; color: ${t.type === 'ဝင်ငွေ' ? '#27ae60' : '#e74c3c'};">
                    ${t.type === "ဝင်ငွေ" ? "+" : "-"}${amt.toLocaleString()} ကျပ်
                </span>
                <button onclick="deleteTransaction('${t.id}')" style="background: none; border: none; cursor: pointer; font-size: 14px;">❌</button>
            </div>`;
        list.appendChild(li);
    });
}

function toggleBankNameInput() {
    const method = document.getElementById('method').value;
    const bankSelect = document.getElementById('bank-select');
    if (bankSelect) {
        bankSelect.style.display = (method === "Cash") ? "none" : "block";
    }
    toggleCustomBankInput();
}

function toggleCustomBankInput() {
    const method = document.getElementById('method').value;
    const bankSelect = document.getElementById('bank-select');
    const customBankInput = document.getElementById('custom-bank-name');
    
    if (customBankInput) {
        if (method === "Banking" && bankSelect && bankSelect.value === "Other") {
            customBankInput.style.display = "block";
        } else {
            customBankInput.style.display = "none";
        }
    }
}
