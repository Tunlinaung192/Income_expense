// transactions.js - Insert, Delete & Google Sync
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

    // ၂။ Google Sheet သို့ လုံခြုံရေးအပိတ်အဆို့ ကင်းဝေးသော URLSearchParams ပုံစံဖြင့် ပို့ခြင်း
    if (navigator.onLine) {
        const formPayload = new URLSearchParams();
        formPayload.append("action", "add");
        formPayload.append("userKey", current_user_key);
        Object.keys(newTx).forEach(key => formPayload.append(key, newTx[key]));

        fetch(google_script_url, {
            method: "POST",
            mode: "no-cors", // ဖုန်း Browser များတွင် Block မဖြစ်အောင် ကာကွယ်ထားသည်
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formPayload
        })
        .then(() => {
            console.log("Sent to Server");
            setTimeout(fetchDataFromGoogleSheets, 2000); // ၂ စက္ကန့်အကြာတွင် ဒေတာပြန်ဆွဲမည်
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

function fetchDataFromGoogleSheets() {
    if (!navigator.onLine || !current_user_key) return;
    
    // ဖုန်းများတွင် CORS Network Error မတက်စေရန် စာရင်းမှတ်တမ်းဟောင်းများကို Fetch လုပ်သည့်စနစ်
    fetch(`${google_script_url}?action=fetch&userKey=${current_user_key}`)
    .then(res => res.json())
    .then(data => {
        if (data && data.length > 0) { 
            transactions = data.reverse(); 
            localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
            render(); 
        }
    }).catch(e => console.log(e));
}
