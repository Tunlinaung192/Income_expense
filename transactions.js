// transactions.js - Data Insert & Sync (GET Query Mode)
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

    // ၂။ Google Sheet သို့ လုံခြုံရေးအပိတ်အဆို့မရှိသော GET လမ်းကြောင်းဖြင့် ပို့ခြင်း
    if (navigator.onLine) {
        const queryString = new URLSearchParams({
            action: "add",
            userKey: current_user_key,
            ...newTx
        }).toString();

        // fetch ဖြင့် Google ဆီသို့ တိုက်ရိုက် လှမ်းခေါ်လိုက်ခြင်း
        fetch(`${google_script_url}?${queryString}`)
        .then(res => res.json())
        .then(resData => {
            console.log("Response from Google:", resData);
            // စာရင်းအသစ်များကို ၁.၅ စက္ကန့်အကြာတွင် Sheet ဆီကနေ ပြန်လည် ဆွဲယူမည်
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
    fetch(`${google_script_url}?action=fetch&userKey=${current_user_key}`)
    .then(res => res.json())
    .then(data => {
        if (data && data.length > 0) { 
            transactions = data.reverse(); 
            localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
            render(); 
        }
    }).catch(e => console.log("Fetch Error:", e));
}
