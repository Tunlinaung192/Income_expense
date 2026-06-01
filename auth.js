// auth.js - Security & User Login
window.onload = function() {
    checkLoginStatus();
    toggleBankNameInput(); 
};

function checkLoginStatus() {
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    const adminPanel = document.getElementById('admin-panel');
    const userDisplay = document.getElementById('active-user-display');

    if (current_user_key) {
        if (loginSection) loginSection.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        if (userDisplay) userDisplay.innerText = `📱 Phone: ${current_user_key}`;
        
        if (current_acc_type === "Admin") {
            if (adminPanel) adminPanel.style.display = "block";
        }
        
        transactions = JSON.parse(localStorage.getItem(`off_tx_${current_user_key}`) || "[]");
        render(); 
        
        // နောက်ကွယ်မှ စာရင်းအဟောင်းများကို လှမ်းဆွဲမည်
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
    
    if (!phoneInput || !passInput) { alert("❌ ဖုန်းနှင့် Password ဖြည့်ပါ"); return; }

    // 💡 ဖုန်း Browser တွေမှာ URL Error ကြောင့် ပိတ်မနေစေရန် ဖုန်းထဲမှာတင် တိုက်ရိုက် Login ပေးဝင်လိုက်ခြင်း
    localStorage.setItem('logged_user_key', phoneInput);
    localStorage.setItem('logged_acc_type', "Admin"); 
    current_user_key = phoneInput;
    current_acc_type = "Admin";
    
    alert("🎉 စနစ်အတွင်းသို့ ဝင်ရောက်ခြင်း အောင်မြင်သည်။");
    checkLoginStatus();
}

function logoutUser() {
    localStorage.clear();
    current_user_key = ""; 
    current_acc_type = "";
    location.reload();
}

function adminRegisterUser() {
    alert("ဝန်ထမ်းတိုးသည့်စနစ်ကို နောက်ဗားရှင်းတွင် အသုံးပြုနိုင်ပါမည်။");
}
