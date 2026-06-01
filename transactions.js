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
    if (!amountInput || !descInput) { alert("❌ ပမာဏနှင့် အကြောင်းအရာ ဖြည့်စွက်ပေးပါ"); return; }

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

    // ၁။ ဖုန်းမျက်နှာပြင်ပေါ်တွင် စာရင်းကို ချက်ချင်းတိုးပြမည် (Offline First)
    transactions.unshift(newTx);
    localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
    render();

    // ၂။ Google Sheet သို့ ပုံစံမှန် URLSearchParams စနစ်ဖြင့် လှမ်းပို့ခြင်း
    if (navigator.onLine) {
        const formPayload = new URLSearchParams();
        formPayload.append("action", "add");
        formPayload.append("userKey", current_user_key);
        
        // သတ်မှတ်ချက်များကို တစ်ခုချင်းစီ ထည့်သွင်းခြင်း
        Object.keys(newTx).forEach(key => {
            formPayload.append(key, newTx[key]);
        });

        fetch(google_script_url, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formPayload
        })
        .then(() => {
            console.log("စာရင်းကို Google Sheet သို့ အောင်မြင်စွာ ပို့ပြီးပါပြီ။");
            // စာရင်းအသစ်များကို Google Sheet ထံမှ ၁ စက္ကန့်အကြာတွင် ပြန်လည် Update ဆွဲယူမည်
            setTimeout(fetchDataFromGoogleSheets, 1500);
        })
        .catch(err => console.log("Network Sync Error:", err));
    }

    // Input Box များကို ပြန်ရှင်းထုတ်ခြင်း
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
