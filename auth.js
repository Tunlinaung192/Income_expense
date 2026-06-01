// auth.js - Security & Dashboard Management

window.onload = function() {
    checkLoginStatus();
    if(typeof toggleBankNameInput === "function") { toggleBankNameInput(); }
};

function checkLoginStatus() {
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    const adminPanel = document.getElementById('admin-panel');
    const userDisplay = document.getElementById('active-user-display');
    const balanceCard = document.querySelector('.balance-card'); // စာရင်းဇယားကတ်ပြား

    if (current_user_key) {
        if (loginSection) loginSection.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        if (userDisplay) userDisplay.innerText = `📱 Phone: ${current_user_key} (${current_acc_type})`;
        
        // 🚨 [အရေးကြီးဆုံးအပိုင်း] ဝင်ထားသူသည် Admin မဟုတ်ပါက...
        if (current_acc_type === "User") {
            if (adminPanel) adminPanel.style.display = "none";   // ဝန်ထမ်းတိုးတဲ့ Panel ကို ဖျောက်မည်
            if (balanceCard) balanceCard.style.display = "none"; // စုစုပေါင်း ဝင်ငွေ/ထွက်ငွေ လက်ကျန် Dashboard ကို ဖျောက်မည်
        } else {
            // Admin ဖြစ်ပါက အကုန် ပြန်ပြမည်
            if (adminPanel) adminPanel.style.display = "block";
            if (balanceCard) balanceCard.style.display = "block";
        }
        
        transactions = JSON.parse(localStorage.getItem(`off_tx_${current_user_key}`) || "[]");
        render(); 

        if (navigator.onLine) { fetchDataFromGoogleSheets(); }
    } else {
        if (loginSection) loginSection.style.display = "block";
        if (mainApp) mainApp.style.display = "none";
    }
}

function loginUser() {
    let phoneInput = document.getElementById('user-phone').value.trim();
    let passInput = document.getElementById('user-password').value.trim();
    
    phoneInput = convertMyanmarToEnglishDigits(phoneInput);
    passInput = convertMyanmarToEnglishDigits(passInput);
    
    if (!phoneInput || !passInput) { alert("❌ ဖုန်းနံပါတ်နှင့် Password ဖြည့်ပါ"); return; }

    // Server (Google Sheets) သို့ လှမ်းစစ်ခြင်း
    if (navigator.onLine) {
        fetch(`${google_script_url}?action=check_login&phoneNumber=${phoneInput}&password=${passInput}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === "approved") {
                localStorage.setItem('logged_user_key', data.userKey);
                localStorage.setItem('logged_acc_type', data.accType);
                current_user_key = data.userKey;
                current_acc_type = data.accType;
                
                alert(`🎉 ဝင်ရောက်ခြင်းအောင်မြင်သည်။ ရာထူး: ${data.accType}`);
                checkLoginStatus();
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            alert("🌐 ကွန်ရက်ချိတ်ဆက်မှု မာန်နေပါသည်။ Incognito Mode ဖြင့် ပြန်လည်စမ်းသပ်ပါ။");
        });
    } else {
        alert("❌ အကောင့်ဝင်ရန် အင်တာနက်လိုင်း လိုအပ်ပါသည်။");
    }
}

// 👥 Admin ကနေ ဝန်ထမ်းအသစ်တိုးပြီး Admin Password တောင်းမည့် စနစ်
function registerNewUserByAdmin() {
    let newPhone = document.getElementById('new-user-phone').value.trim();
    let newPass = document.getElementById('new-user-pass').value.trim();
    
    newPhone = convertMyanmarToEnglishDigits(newPhone);
    newPass = convertMyanmarToEnglishDigits(newPass);

    if (!newPhone || !newPass) { alert("❌ ဝန်ထမ်းဖုန်းနှင့် Password ဖြည့်ပါ"); return; }
    
    // 🔑 Admin Password အား အတည်ပြုချက်တောင်းခြင်း
    let adminConfirmPass = prompt("🔒 ဤဝန်ထမ်းအား ဆောက်လုပ်ရန် သင်၏ Admin Password (ဝင်ခွင့်ကုဒ်) ကို ရိုက်ထည့်ပါ:");
    if (adminConfirmPass === null) return;
    adminConfirmPass = convertMyanmarToEnglishDigits(adminConfirmPass.trim());

    if (navigator.onLine) {
        const formPayload = new URLSearchParams();
        formPayload.append("action", "register_user");
        formPayload.append("newPhone", newPhone);
        formPayload.append("newPassword", newPass);
        formPayload.append("adminPassword", adminConfirmPass);fetch(google_script_url, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formPayload
        }).then(() => {
            alert("🎉 စနစ်အတွင်းသို့ ပို့လွှတ်ပြီးပါပြီ။ (Password မှန်ကန်ပါက Sheet ထဲတွင် အော်တို တိုးသွားပါမည်)");
            document.getElementById('new-user-phone').value = "";
            document.getElementById('new-user-pass').value = "";
        }).catch(err => alert("Error: " + err));
    } else {
        alert("🌐 အင်တာနက်လိုင်း လိုအပ်ပါသည်။");
    }
}

function logoutUser() {
    localStorage.clear();
    current_user_key = ""; 
    current_acc_type = "";
    location.reload();
}
