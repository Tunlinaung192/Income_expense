// auth.js - User Authentication
window.onload = function() {
    checkLoginStatus();
    toggleBankNameInput(); 
};

function checkLoginStatus() {
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    const userDisplay = document.getElementById('active-user-display');

    if (current_user_key) {
        if (loginSection) loginSection.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        if (userDisplay) userDisplay.innerText = `📱 Phone: ${current_user_key} (${current_acc_type})`;
        
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
    const loginBtn = document.getElementById('login-btn');
    
    phoneInput = convertMyanmarToEnglishDigits(phoneInput);
    passInput = convertMyanmarToEnglishDigits(passInput);
    
    if (!phoneInput || !passInput) { alert("❌ ဖုန်းနံပါတ်နှင့် Password ဖြည့်ပါ"); return; }

    // ဖုန်း Browser များတွင် URL Error ကြောင့် ပိတ်မနေစေရန် ဖုန်းထဲမှာတင် တိုက်ရိုက် အရင်ပေးဝင်လိုက်ခြင်း
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
