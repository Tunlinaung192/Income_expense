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
    const balanceCard = document.querySelector('.balance-card');

    if (current_user_key) {
        if (loginSection) loginSection.style.display = "none";
        if (mainApp) mainApp.style.display = "block";
        if (userDisplay) userDisplay.innerText = `📱 Phone: ${current_user_key} (${current_acc_type})`;
        
        if (current_acc_type === "User") {
            if (adminPanel) adminPanel.style.display = "none";
            if (balanceCard) balanceCard.style.display = "none";
        } else {
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
            alert("🌐 ချက်ဆက်မှု Error တက်နေပါသည်။ Web App URL ကို စစ်ဆေးပါ။");
        });
    } else {
        alert("❌ အကောင့်ဝင်ရန် အင်တာနက်လိုင်း လိုအပ်ပါသည်။");
    }
}

function registerNewUserByAdmin() {
    let newPhone = document.getElementById('new-user-phone').value.trim();
    let newPass = document.getElementById('new-user-pass').value.trim();
    
    newPhone = convertMyanmarToEnglishDigits(newPhone);
    newPass = convertMyanmarToEnglishDigits(newPass);

    if (!newPhone || !newPass) { alert("❌ ဝန်ထမ်းဖုန်းနှင့် Password ဖြည့်ပါ"); return; }
    
    let adminConfirmPass = prompt("🔒 ဤဝန်ထမ်းအား ဆောက်လုပ်ရန် သင်၏ Admin Password ကို ရိုက်ထည့်ပါ:");
    if (adminConfirmPass === null) return;
    adminConfirmPass = convertMyanmarToEnglishDigits(adminConfirmPass.trim());

    if (navigator.onLine) {
        fetch(`${google_script_url}?action=register_user&newPhone=${newPhone}&newPassword=${newPass}&currentAdminPhone=${current_user_key}&adminPassword=${adminConfirmPass}`)
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") {
                document.getElementById('new-user-phone').value = "";
                document.getElementById('new-user-pass').value = "";
            }
        })
        .catch(err => alert("Error: " + err));
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
