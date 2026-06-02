// transactions.js - Insert, Delete & Auto Google Sync

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
        accType: current_acc_type || "Admin",
        type: type,
        amount: parseFloat(amountInput),
        description: descInput,
        date: now.toLocaleDateString('en-CA'),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: methodInput,
        bankName: bankNameInput
    };

    // ၁။ ဖုန်းမျက်နှာပြင်ပေါ်တွင် စာရင်းကို ချက်ချင်းတိုးပြမည် (Offline First စနစ်)
    transactions.unshift(newTx);
    localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
    render();

    // ၂။ Google Sheet သို့ ပို့ခြင်း
    if (navigator.onLine) {
        const formPayload = new URLSearchParams();
        formPayload.append("action", "add");
        formPayload.append("userKey", current_user_key);
        formPayload.append("accType", current_acc_type);
        Object.keys(newTx).forEach(key => formPayload.append(key, newTx[key]));

        fetch(google_script_url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formPayload
        })
        .then(() => {
            console.log("Sent to Server");
            setTimeout(fetchDataFromGoogleSheets, 2000); // သွင်းပြီး ၂ စက္ကန့်အကြာတွင် နောက်ဆုံးအခြေအနေကို ဆွဲယူမည်
        })
        .catch(err => console.log(err));
    }

    document.getElementById('amount').value = "";
    document.getElementById('description').value = "";
}

function deleteTransaction(id) {
    let deletePass = prompt("🔑 ဤစာရင်းဖျက်ရန် Admin Password ရိုက်ထည့်ပါ:");
    if (deletePass === null) return; 
    deletePass = convertMyanmarToEnglishDigits(deletePass.trim());

    if (navigator.onLine) {
        const formPayload = new URLSearchParams();
        formPayload.append("action", "delete");
        formPayload.append("id", id);
        formPayload.append("adminPassword", deletePass);

        fetch(google_script_url, {
            method: "POST",
            mode: "no-cors",
            body: formPayload
        }).then(() => {
            alert("🎉 ဖျက်သိမ်းပြီးပါပြီ (Server သို့ လှမ်းပို့ပြီး)");
            setTimeout(fetchDataFromGoogleSheets, 1500);
        });
    } else {
        alert("🌐 စာရင်းဖျက်ရန် အင်တာနက်လိုင်း လိုအပ်ပါသည်။");
    }
}

// 🔄 Google Sheet မှ ဒေတာများကို ဆွဲယူပြီး App ထဲသို့ ပြန်ထည့်ပေးမည့် စနစ်
function fetchDataFromGoogleSheets() {
    if (!navigator.onLine || !current_user_key) return;
    
    fetch(`${google_script_url}?action=fetch&userKey=${current_user_key}&accType=${current_acc_type}`)
    .then(res => res.json())
    .then(data => {
        if (data && Array.isArray(data)) { 
            // Google Sheet က ဒေတာတွေကို အဆင်လိုက်ဖြစ်အောင် လုပ်ပြီး သိမ်းဆည်းခြင်း
            transactions = data.reverse(); 
            localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
            render(); 
            console.log("Sheet ဒေတာများနှင့် အောင်မြင်စွာ Sync ပြုလုပ်ပြီးပါပြီ။");
        }
    }).catch(e => console.log("Sync Error:", e));
}

// ⏰ [အော်တိုဒေတာ Sync စနစ်] စက္ကန့် ၃၀ လျှင် တစ်ကြိမ် Google Sheet ဆီကနေ ဒေတာအသစ်များကို အလိုအလျောက် ဆွဲယူမည်
setInterval(() => {
    if (current_user_key && navigator.onLine) {
        fetchDataFromGoogleSheets();
    }}, 30000); // 30000 ms = စက္ကန့် ၃၀
