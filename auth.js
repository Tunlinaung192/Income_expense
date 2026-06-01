// auth.js - Authentication & User Session Management
window.onload = function() {
    checkLoginStatus();
    toggleBankNameInput(); 
};

function checkLoginStatus() {
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    const adminPanel = document.getElementById('admin-panel');
    const userDisplay = document.getElementById('active-user-display');

    if (current_user_key && current_acc_type) {
        if (loginSection) loginSection.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        if (userDisplay) userDisplay.innerText = `📱 Phone: ${current_user_key} (${current_acc_type})`;
        
        if (current_acc_type === "Admin") {
            adminPanel.style.display = "block";
        } else {
            adminPanel.style.display = "none";
        }
        
        transactions = JSON.parse(localStorage.getItem(`off_tx_${current_user_key}`) || "[]");
        unsynced_items = JSON.parse(localStorage.getItem(`un_syn_${current_user_key}`) || "[]");
        pending_deletes = JSON.parse(localStorage.getItem(`pen_del_${current_user_key}`) || "[]");
        render(); 

        if (navigator.onLine) {
            fetchDataFromGoogleSheets();
            syncOfflineDataToGoogle();
        }
        window.removeEventListener('online', syncOfflineDataToGoogle);
        window.addEventListener('online', syncOfflineDataToGoogle);
    } else {
        if (loginSection) loginSection.style.display = "block";
        if (mainApp) mainApp.style.display = "none";
    }
}

function loginUser() {
    let phoneInput = document.getElementById('user-phone').value.trim();
    let passInput = document.getElementById('user-password').value.trim();
    const loginBtn = document.getElementById('login-btn');
    
    phoneInput = convertMyanmarToEnglishDigits(phoneInput);
    passInput = convertMyanmarToEnglishDigits(passInput);
    
    if (!phoneInput || !passInput) { alert("❌ ဖုန်းနံပါတ်နှင့် ဝင်ခွင့်ကုဒ် နှစ်ခုလုံး ဖြည့်ပါ!"); return; }
    if (!navigator.onLine) { alert("🌐 အကောင့်ဝင်ရန် အင်တာနက်လိုင်း လိုအပ်ပါသည်။"); return; }
    
    loginBtn.innerText = "⏳ စစ်ဆေးနေပါသည်..."; 
    loginBtn.disabled = true;

    fetch(google_script_url, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({ action: "check_login", phoneNumber: phoneInput, password: passInput })
    })
    .then(res => res.json())
    .then(response => {
        loginBtn.innerText = "🔐 အကောင့်အတည်ပြုမည်"; 
        loginBtn.disabled = false;
        
        if (response.status === "approved") {
            localStorage.setItem('logged_user_key', response.userKey);
            localStorage.setItem('logged_acc_type', response.accType);
            current_user_key = response.userKey; 
            current_acc_type = response.accType;
            alert("🎉 အကောင့်ဝင်ရောက်မှု အောင်မြင်သည်။");
            checkLoginStatus();
        } else { 
            alert("❌ " + response.message); 
        }
    })
    .catch(err => {
        loginBtn.innerText = "🔐 အကောင့်အတည်ပြုမည်"; 
        loginBtn.disabled = false;
        alert("⚠️ ချိတ်ဆက်မှု Error တက်နေပါသည်။ Web App URL ကို သေჩာစစ်ဆေးပေးပါဗျာ။");
    });
}

function logoutUser() {
    localStorage.clear();
    current_user_key = ""; 
    current_acc_type = "";
    checkLoginStatus();
}

function adminRegisterUser() {
    let rPhone = document.getElementById('reg-phone').value.trim();
    let rPass = document.getElementById('reg-password').value.trim();
    let adminConfirmPass = document.getElementById('admin-confirm-password').value.trim();
    
    rPhone = convertMyanmarToEnglishDigits(rPhone);
    rPass = convertMyanmarToEnglishDigits(rPass);
    adminConfirmPass = convertMyanmarToEnglishDigits(adminConfirmPass);
    
    if (!rPhone || !rPass) { alert("❌ ဝန်ထမ်း၏ ဖုန်းနံပါတ်နှင့် Password ဖြည့်ပါ!"); return; }
    if (!adminConfirmPass) { alert("❌ အကောင့်ဆောက်ရန် သင့်ရဲ့ Admin Password ကို ရိုက်ထည့်ပါ!"); return; }
    if (!navigator.onLine) { alert("🌐 အကောင့်ဆောက်ရန် အင်တာနက်လိုင်း လိုအပ်ပါသည်။"); return; }

    fetch(google_script_url, {
        method: "POST",
        body: JSON.stringify({ action: "admin_register_user", regPhone: rPhone, regPassword: rPass, adminConfirmPassword: adminConfirmPass })
    })
    .then(res => res.json())
    .then(response => {
        alert(response.message);
        if (response.status === "success") {
            document.getElementById('reg-phone').value = "";
            document.getElementById('reg-password').value = "";
            document.getElementById('admin-confirm-password').value = "";
        }
    });
}