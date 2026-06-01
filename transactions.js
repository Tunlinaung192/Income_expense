// transactions.js - Data Insert & Sync
function addTransaction(type) {
    let amountInput = document.getElementById('amount').value.trim();
    const descInput = document.getElementById('description').value.trim();
    const methodInput = document.getElementById('method').value;
    amountInput = convertMyanmarToEnglishDigits(amountInput);

    let bankNameInput = "Cash";
    if (methodInput === "Banking") {
        const bankSelect = document.getElementById('bank-select').value;
        bankNameInput = (bankSelect === "Other") ? document.getElementById('custom-bank-name').value.trim() : bankSelect;
    }
    if (!amountInput || !descInput) { alert("❌ ဖြည့်စွက်ပေးပါ"); return; }

    const now = new Date();
    const newTx = {
        id: now.getTime().toString(),
        accType: "Admin",
        type: type,
        amount: parseFloat(amountInput),
        description: descInput,
        date: now.toLocaleDateString('en-CA'),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: methodInput,
        bankName: bankNameInput
    };

    // ဖုန်းမျက်နှာပြင်ပေါ်တွင် ချက်ချင်းစာရင်းတိုးပြမည်
    transactions.unshift(newTx);
    localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
    render();

    // Google Sheet သို့ ဒေတာလှမ်းပို့ခြင်း (ဖုန်းအတွက် အကောင်းဆုံး Parameters စနစ်)
    if (navigator.onLine) {
        const urlParams = new URLSearchParams();
        urlParams.append("action", "add");
        urlParams.append("userKey", current_user_key);
        Object.keys(newTx).forEach(key => urlParams.append(key, newTx[key]));

        fetch(google_script_url, {
            method: "POST",
            mode: "no-cors", // ⚠️ CORS Security အား ကျော်ဖြတ်ရန် မဖြစ်မနေ သုံးရပါမည်
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: urlParams
        }).then(() => {
            console.log("Data Sent to Google Sheet!");
        }).catch(err => console.log("Sync Error:", err));
    }

    document.getElementById('amount').value = "";
    document.getElementById('description').value = "";
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id.toString() !== id.toString());
    localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
    render();
    alert("စာရင်းကို ဖုန်းထဲမှ ဖျက်ပြီးပါပြီ။");
}

function fetchDataFromGoogleSheets() {
    if (!navigator.onLine || !current_user_key) return;
    fetch(`${google_script_url}?userKey=${current_user_key}&accType=Admin`)
    .then(res => res.json())
    .then(data => {
        if (data && data.length > 0) { 
            transactions = data.reverse(); 
            localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
            render(); 
        }
    }).catch(e => console.log("Fetch Error:", e));
}
