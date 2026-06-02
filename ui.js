// ui.js - Render Dashboard Data & Drop-list (Accordion) Wise Bank Balances

let activeMethodFilter = "All";

// 🌟 [အသစ်ထည့်သွင်းမှု] Drop list အား ဖွင့်ရန်/ပိတ်ရန် တွက်ချက်မှု Function
function toggleBankDropdownList() {
    const content = document.getElementById('bank-accordion-content');
    const arrow = document.getElementById('accordion-arrow');
    
    if (content && arrow) {
        if (content.style.display === "block") {
            content.style.display = "none";
            arrow.innerText = "🔽";
            // ပိတ်လိုက်တဲ့အခါ ထိပ်ပိုင်းဘောင်ဝိုင်းလေး ပြန်လှအောင်လုပ်ခြင်း
            document.querySelector('.bank-accordion-header').style.borderRadius = "6px";
        } else {
            content.style.display = "block";
            arrow.innerText = "🔼";
            // ဖွင့်လိုက်တဲ့အခါ အောက်ဘက်ထောင့်စွန်းများကို Table နှင့် တစ်ဆက်တည်းဖြစ်အောင် လုပ်ခြင်း
            document.querySelector('.bank-accordion-header').style.borderRadius = "6px 6px 0 0";
        }
    }
}

function changeMethodFilter(filterType) {
    activeMethodFilter = filterType;
    
    const btnAll = document.getElementById('filter-all-btn');
    const btnBank = document.getElementById('filter-banking-btn');
    const btnCash = document.getElementById('filter-cash-btn');
    const bankFilterSelect = document.getElementById('bank-filter-select');
    
    if(btnAll) btnAll.classList.remove('active');
    if(btnBank) btnBank.classList.remove('active');
    if(btnCash) btnCash.classList.remove('active');
    
    if (filterType === 'All' && btnAll) btnAll.classList.add('active');
    if (filterType === 'Banking' && btnBank) btnBank.classList.add('active');
    if (filterType === 'Cash' && btnCash) btnCash.classList.add('active');
    
    if (bankFilterSelect) {
        if (filterType === "Banking") {
            bankFilterSelect.style.display = "block";
            bankFilterSelect.value = "All_Banks"; 
        } else {
            bankFilterSelect.style.display = "none";
        }
    }
    
    render();
}

function render() {
    const listEl = document.getElementById('transaction-list');
    if (!listEl) return;
    listEl.innerHTML = "";

    const searchSearchEl = document.getElementById('tx-search-input');
    const searchQuery = searchSearchEl ? searchSearchEl.value.trim().toLowerCase() : "";

    const bankSelectEl = document.getElementById('bank-filter-select');
    const selectedBankFilter = bankSelectEl ? bankSelectEl.value : "All_Banks";

    let totalInc = 0;
    let totalExp = 0;
    let bankBal = 0;
    let cashBal = 0;

    let bankBalances = {
        "Kpay": 0,
        "Wavepay": 0,
        "AYAPay": 0,
        "CBPay": 0,
        "KBZ Bank": 0,
        "CB Bank": 0,
        "Other": 0
    };

    transactions.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        let bName = tx.bankName || "Other";
        
        if (!bankBalances.hasOwnProperty(bName)) {
            bName = "Other";
        }

        if (tx.type === "ဝင်ငွေ") {
            totalInc += amt;
            if (tx.method === "Banking") {
                bankBal += amt;
                bankBalances[bName] += amt; 
            } else {
                cashBal += amt;
            }
        } else if (tx.type === "ထွက်ငွေ") {
            totalExp += amt;
            if (tx.method === "Banking") {
                bankBal -= amt;
                bankBalances[bName] -= amt; 
            } else {
                cashBal -= amt;
            }
        }
    });

    const netBal = totalInc - totalExp;
    const combinedBal = bankBal + cashBal;

    const netEl = document.getElementById('net-balance');
    const incEl = document.getElementById('total-income');
    const expEl = document.getElementById('total-expense');
    const combEl = document.getElementById('combined-balance');
    const bnkEl = document.getElementById('banking-balance');
    const cshEl = document.getElementById('cash-balance');

    if (netEl) netEl.innerText = `${netBal.toLocaleString()} ကျပ်`;
    if (incEl) incEl.innerText = `${totalInc.toLocaleString()} ကျပ်`;
    if (expEl) expEl.innerText = `${totalExp.toLocaleString()} ကျပ်`;

    if (combinedBal < 0) {
        if (combEl) combEl.innerHTML = `<span style="color:#e74c3c;">${combinedBal.toLocaleString()} ကျပ်</span>`;
    } else {
        if (combEl) combEl.innerText = `${combinedBal.toLocaleString()} ကျပ်`;
    }
    if (bnkEl) bnkEl.innerText = `${bankBal.toLocaleString()} ကျပ်`;
    if (cshEl) cshEl.innerText = `${cashBal.toLocaleString()} ကျပ်`;

    // Drop list (Accordion Table) ထဲသို့ ဒေတာများထည့်သွင်းခြင်း
    const bankTableBody = document.getElementById('bank-breakdown-rows');
    if (bankTableBody) {
        bankTableBody.innerHTML = "";
        
        const bankDisplayNames = {
            "Kpay": "📱 KBZ Pay",
            "Wavepay": "📱 Wave Pay",
            "AYAPay": "📱 AYA Pay",
            "CBPay": "📱 CB Pay",
            "KBZ Bank": "🏦 KBZ Bank",
            "CB Bank": "🏦 CB Bank",
            "Other": "✨ အခြားဘဏ်များ (Other)"
        };

        for (let key in bankBalances) {
            const row = document.createElement('tr');
            const balVal = bankBalances[key];
            const colorStyle = balVal < 0 ? "color:#e74c3c; font-weight:bold;" : "font-weight:bold;";

            row.innerHTML = `
                <td>${bankDisplayNames[key]}</td>
                <td style="text-align: right; ${colorStyle}">${balVal.toLocaleString()} ကျပ်</td>
            `;
            bankTableBody.appendChild(row);
        }
    }

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

        if (activeMethodFilter !== "All" && tMethod !== activeMethodFilter) {
            return; 
        }

        if (activeMethodFilter === "Banking" && selectedBankFilter !== "All_Banks") {
            if (selectedBankFilter === "Other") {
                const knownBanks = ["Kpay", "Wavepay", "AYAPay", "CBPay", "KBZ Bank", "CB Bank"];
                if (knownBanks.includes(tBank)) {
                    return; 
                }
            } else if (tBank !== selectedBankFilter) {
                return; 
            }
        }

        const matchDesc = tDesc.toLowerCase().includes(searchQuery);
        const matchUser = tUser.toLowerCase().includes(searchQuery);
        const matchBank = tBank.toLowerCase().includes(searchQuery);
        const matchRole = tRole.toLowerCase().includes(searchQuery);

        if (searchQuery && !matchDesc && !matchUser && !matchBank && !matchRole) {
            return; 
        }

        const li = document.createElement('li');
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
            <div style="text-align:right;"><span style="font-weight:bold; font-size:16px; color:${tType === 'ဝင်ငွေ' ? '#27ae60' : '#e74c3c'};">
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
        bankSelect.style.display = (method === 'Banking' ? 'block' : 'none');
    }
    toggleCustomBankInput();
}

function toggleCustomBankInput() {
    const method = document.getElementById('method').value;
    const bankSelect = document.getElementById('bank-select').value;
    const customBank = document.getElementById('custom-bank-name');
    if (customBank) {
        customBank.style.display = (method === 'Banking' && bankSelect === 'Other' ? 'block' : 'none');
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
