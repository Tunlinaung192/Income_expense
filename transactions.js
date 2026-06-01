// transactions.js - Insert, Delete and Server Synchronization logic
function addTransaction(type) {
    let amountInput = document.getElementById('amount').value.trim();
    const descInput = document.getElementById('description').value.trim();
    const methodInput = document.getElementById('method').value;
    amountInput = convertMyanmarToEnglishDigits(amountInput);

    let bankNameInput = "Cash";
    if (methodInput === "Banking") {
        const bankSelect = document.getElementById('bank-select').value;
        bankNameInput = (bankSelect === "Other") ? document.getElementById('custom-bank-name').value.trim() : bankSelect;
        if (!bankNameInput) { alert("❌ ဘဏ်နာမည် ထည့်ပါ!"); return; }
    }
    if (!amountInput || !descInput) { alert("❌ ပမာဏနှင့် အကြောင်းအရာ ဖြည့်ပါ!"); return; }

    const now = new Date();
    const newTx = {
        id: now.getTime().toString(),
        accType: current_acc_type,
        type: type,
        amount: parseFloat(amountInput),
        description: descInput,
        date: now.toLocaleDateString('en-CA'),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: methodInput,
        bankName: bankNameInput
    };

    transactions.unshift(newTx);
    saveLocalState();
    render();
    
    if (navigator.onLine) {
        fetch(google_script_url, {
            method: "POST",
            body: JSON.stringify({ action: "add", userKey: current_user_key, ...newTx })
        })
        .then(res => res.json())
        .then(resData => {
            if(resData.status !== "success") { transactions = transactions.filter(t => t.id !== newTx.id); alert(resData.message); }
            saveLocalState(); render();
        })
        .catch(() => { unsynced_items.push(newTx); saveLocalState(); });
    } else {
        unsynced_items.push(newTx);
        saveLocalState();
    }

    document.getElementById('amount').value = "";
    document.getElementById('description').value = "";
}

function deleteTransaction(id) {
    let deletePass = prompt("🔑 ဤစာရင်းမှတ်တမ်းအား ဖြတ်ပစ်ရန် Admin Password ကို ရိုက်ထည့်ပါ:");
    if (deletePass === null) return; 
    
    deletePass = convertMyanmarToEnglishDigits(deletePass.trim());
    if (!deletePass) { alert("❌ အတည်ပြုချက် Password လိုအပ်ပါသည်!"); return; }

    const backupTx = [...transactions];
    transactions = transactions.filter(t => t.id.toString() !== id.toString());
    saveLocalState(); render();

    if (navigator.onLine) {
        fetch(google_script_url, {
            method: "POST",
            body: JSON.stringify({ action: "delete", id: id, adminPassword: deletePass })
        })
        .then(res => res.json())
        .then(response => {
            if (response.status !== "success") { 
                alert(response.message); 
                transactions = backupTx; 
                saveLocalState(); render();
            } else {
                alert("🎉 စာရင်းဖျက်သိမ်းပြီးပါပြီ။");
            }
        })
        .catch(() => { 
            pending_deletes.push({ id: id, adminPassword: deletePass }); 
            saveLocalState(); 
        });
    } else {
        pending_deletes.push({ id: id, adminPassword: deletePass });
        saveLocalState();
    }
}

function fetchDataFromGoogleSheets() {
    if (!navigator.onLine) return;
    fetch(`${google_script_url}?userKey=${current_user_key}&accType=${current_acc_type}`)
    .then(res => res.json())
    .then(data => {
        if (unsynced_items.length === 0 && pending_deletes.length === 0 && data) { 
            transactions = data.reverse(); saveLocalState(); render(); 
        }
    }).catch(e => console.log(e));
}

function syncOfflineDataToGoogle() {
    if (!navigator.onLine) return;
    
    if (pending_deletes.length > 0) {
        let deletePromises = pending_deletes.map(delItem => {
            return fetch(google_script_url, {
                method: "POST",
                body: JSON.stringify({ action: "delete", id: delItem.id, adminPassword: delItem.adminPassword })
            }).then(res => res.json());
        });Promise.all(deletePromises).then(() => { pending_deletes = []; saveLocalState(); });
    }

    if (unsynced_items.length > 0) {
        let addPromises = unsynced_items.map(item => {
            return fetch(google_script_url, {
                method: "POST",
                body: JSON.stringify({ action: "add", userKey: current_user_key, ...item })
            }).then(res => res.json());
        });
        Promise.all(addPromises).then(() => { unsynced_items = []; saveLocalState(); fetchDataFromGoogleSheets(); });
    }
}

function saveLocalState() {
    localStorage.setItem(`off_tx_${current_user_key}`, JSON.stringify(transactions));
    localStorage.setItem(`un_syn_${current_user_key}`, JSON.stringify(unsynced_items));
    localStorage.setItem(`pen_del_${current_user_key}`, JSON.stringify(pending_deletes));
}