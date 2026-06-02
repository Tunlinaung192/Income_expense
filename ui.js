// ui.js - Render Dashboard Data & List Display with Live Filter & Method Tab Search

// စာရင်းစစ်ထုတ်မည့်အခြေအနေအား သိမ်းဆည်းရန် Global Variable (All, Banking, Cash)
let activeMethodFilter = "All";

function changeMethodFilter(filterType) {
    activeMethodFilter = filterType;
    
    // ခလုတ်များ၏ အရောင်အသွေး (Active State) ကို လဲလှယ်ခြင်း
    const btnAll = document.getElementById('filter-all-btn');
    const btnBank = document.getElementById('filter-banking-btn');
    const btnCash = document.getElementById('filter-cash-btn');
    
    if(btnAll) btnAll.classList.remove('active');
    if(btnBank) btnBank.classList.remove('active');
    if(btnCash) btnCash.classList.remove('active');
    
    if (filterType === 'All' && btnAll) btnAll.classList.add('active');
    if (filterType === 'Banking' && btnBank) btnBank.classList.add('active');
    if (filterType === 'Cash' && btnCash) btnCash.classList.add('active');
    
    // UI အား ပြန်လည်ဆွဲတင်ခြင်း
    render();
}

function render() {
    const listEl = document.getElementById('transaction-list');
    if (!listEl) return;
    listEl.innerHTML = "";

    // 🔍 Search Box ထဲမှ ရိုက်ထားသောစာသားအား ဆွဲယူခြင်း
    const searchSearchEl = document.getElementById('tx-search-input');
    const searchQuery = searchSearchEl ? searchSearchEl.value.trim().toLowerCase() : "";

    let totalInc = 0;
    let totalExp = 0;
    let bankBal = 0;
    let cashBal = 0;

    // ၁။ Dashboard ပေါ်က စာရင်းဇယားတွက်ချက်မှုအပိုင်း (မူရင်းစာရင်းအားလုံးအပေါ် အခြေခံတွက်ချက်မည်)
    transactions.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.type === "ဝင်ငွေ") {
            totalInc += amt;
            if (tx.method === "Banking") bankBal += amt;
            else cashBal += amt;
        } else if (tx.type === "ထွက်ငွေ") {
            totalExp += amt;
            if (tx.method === "Banking") bankBal -= amt;
            else cashBal -= amt;
        }
    });

    const netBal = totalInc - totalExp;
    const combinedBal = bankBal + cashBal;

    // ဒေတာများကို Dashboard UI သို့ ပို့ခြင်း
    const netEl = document.getElementById('net-balance');
    const incEl = document.getElementById('total-income');
    const expEl = document.getElementById('total-expense');
    const combEl = document.getElementById('combined-balance');
    const bnkEl = document.getElementById('banking-balance');
    const cshEl = document.getElementById('cash-balance');

    if (netEl) netEl.innerText = `${netBal.toLocaleString()} ကျပ်`;
    if (incEl) incEl.innerText = `${totalInc.toLocaleString()} ကျပ်`;
    if (expEl) expEl.innerText = `${totalExp.toLocaleString()} ကျပ်`;
    if (combEl) combEl.innerText = `${combinedBal.toLocaleString()} ကျပ်`;
    if (bnkEl) bnkEl.innerText = `${bankBal.toLocaleString()} ကျပ်`;
    if (cshEl) cshEl.innerText = `${cashBal.toLocaleString()} ကျပ်`;

    // 🔍 ၂။ စာရင်းများကို အောက်ခြေစာရင်းပုံးထဲ ထည့်သွင်းပြသခြင်း (Method နှင့် Search Filter ပါ တွဲစစ်မည်)
    transactions.forEach(tx => {
        const tId = tx.id || "";
        const tUser = tx.userKey || "";
        const tRole = tx.accType || "";
        const tType = tx.type || "";
        const tAmt = tx.amount || 0;
        const tDesc = tx.description || "";
        const tDate = tx.date || "";
        const tTime = tx.time || "";
        const tMethod = tx.method || "";
        const tBank = tx.bankName || "";

        // 🌟 ဝင်ငွေ/ထွက်ငွေ ပုံစံ ခွဲခြားစစ်ထုတ်ခြင်း (Banking သို့မဟုတ် Cash)
        if (activeMethodFilter !== "All" && tMethod !== activeMethodFilter) {
            return; // ရွေးချယ်ထားတဲ့ ပုံစံနဲ့ မကိုက်ညီပါက ကျော်သွားမည်
        }

        // စာသားဖြင့် ထပ်ဆင့်ရှာဖွေမှု စည်းမျဉ်းသတ်မှတ်ခြင်း
        const matchDesc = tDesc.toLowerCase().includes(searchQuery);
        const matchUser = tUser.toLowerCase().includes(searchQuery);
        const matchBank = tBank.toLowerCase().includes(searchQuery);
        const matchRole = tRole.toLowerCase().includes(searchQuery);

        if (searchQuery && !matchDesc && !matchUser && !matchBank && !matchRole) {
            return; 
        }const li = document.createElement('li');
        li.className = `tx-item ${tType === 'ဝင်ငွေ' ? 'border-inc' : 'border-exp'}`;
        li.style.borderLeft = tType === 'ဝင်ငွေ' ? "5px solid #27ae60" : "5px solid #e74c3c";
        li.style.background = "#fff";
        li.style.padding = "10px";
        li.style.marginBottom = "8px";
        li.style.borderRadius = "6px";
        li.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        let userBadge = "";
        if (current_acc_type === "Admin") {
            userBadge = `<br><span style="font-size:11px; background:#ebf5fb; color:#2980b9; padding:2px 4px; border-radius:3px; font-weight:bold;">📱 ThwinThu: ${tUser} (${tRole})</span>`;
        }

        li.innerHTML = `
            <div>
                <span style="font-weight:bold; color:#2c3e50;">${tDesc}</span> ${userBadge}
                <div style="font-size:11px; color:#7f8c8d; margin-top:4px;">
                    📅 ${tDate} (${tTime}) | 🏦 ${tMethod === 'Banking' ? tBank : 'လက်ငင်းငွေသား'}
                </div>
            </div>
            <div style="text-align:right;">
                <span style="font-weight:bold; font-size:16px; color:${tType === 'ဝင်ငွေ' ? '#27ae60' : '#e74c3c'};">
                    ${tType === 'ဝင်ငွေ' ? '+' : '-'} ${tAmt.toLocaleString()}
                </span>
                <br>
                <button onclick="deleteTransaction('${tId}')" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:12px; margin-top:4px; padding:0;">🗑 ဖျက်မည်</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

function toggleBankNameInput() {
    const method = document.getElementById('method').value;
    const bankSelect = document.getElementById('bank-select');
    if (bankSelect) {
        bankSelect.style.display = (method === 'Banking') ? 'block' : 'none';
    }
    toggleCustomBankInput();
}

function toggleCustomBankInput() {
    const method = document.getElementById('method').value;
    const bankSelect = document.getElementById('bank-select').value;
    const customBank = document.getElementById('custom-bank-name');
    if (customBank) {
        customBank.style.display = (method === 'Banking' && bankSelect === 'Other') ? 'block' : 'none';
    }
}

function convertMyanmarToEnglishDigits(input) {
    const mmNumbers = ['၀','၁','၂','၃','၄','၅','၆','၇','၈','၉'];
    let output = input.toString();
    for (let i = 0; i < 10; i++) {
        const regex = new RegExp(mmNumbers[i], 'g');
        output = output.replace(regex, i.toString());
    }
    return output;
}
