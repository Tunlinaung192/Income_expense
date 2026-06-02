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

    transactions.unshift(newTx);
    localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
    render();

    if (navigator.onLine) {
        const formPayload = new URLSearchParams();
        formPayload.append("action", "add");
        formPayload.append("userKey", current_user_key);
        formPayload.append("accType", current_acc_type);
        Object.keys(newTx).forEach(key => formPayload.append(key, newTx[key]));

        fetch(google_script_url, {
            method: "POST",
            mode: "no-cors",
            body: formPayload
        })
        .then(() => {
            setTimeout(fetchDataFromGoogleSheets, 2000);
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
        fetch(`${google_script_url}?action=delete&id=${id}&currentAdminPhone=${current_user_key}&adminPassword=${deletePass}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === "success") {
                alert("🎉 စာရင်းအား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။");
                setTimeout(fetchDataFromGoogleSheets, 1000);
            } else {
                alert(data.message || "❌ ဖျက်၍မရပါ။");
            }
        }).catch(() => {
            // mode: no-cors သုံးထားပါက သီးသန့် alert ထပ်မပြစေရန်
            setTimeout(fetchDataFromGoogleSheets, 1500);
        });
    } else {
        alert("🌐 စာရင်းဖျက်ရန် အင်တာနက်လိုင်း လိုအပ်ပါသည်။");
    }
}

function fetchDataFromGoogleSheets() {
    if (!navigator.onLine || !current_user_key) return;
    
    fetch(`${google_script_url}?action=fetch&userKey=${current_user_key}&accType=${current_acc_type}`)
    .then(res => res.json())
    .then(data => {
        if (data && Array.isArray(data)) { 
            transactions = data.reverse(); 
            localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
            render(); 
        }
    }).catch(e => console.log("Sync Error:", e));
}

setInterval(() => {
    if (current_user_key && navigator.onLine) {
        fetchDataFromGoogleSheets();
    }
}, 30000);
