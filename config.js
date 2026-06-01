// config.js - Global Variables, CORS Setup & Service Worker Registration

// ⚠️ အရေးကြီး - အောက်ကလင့်ခ်နေရာမှာ သင့်ရဲ့ Google Web App URL အသစ်ကြီးကို သေချာထည့်ပေးပါ
const google_script_url = "https://script.google.com/macros/s/AKfycbx8kSLKSUwEf0YUlYbbv_wV71WKePuc8vIMSSWorEhSq-12xUxMvLlefcuBvdW1dPXE/exec"; 

let current_user_key = localStorage.getItem('logged_user_key') || "";
let current_acc_type = localStorage.getItem('logged_acc_type') || "";
let transactions = [];      
let unsynced_items = [];    
let pending_deletes = [];   

// Service Worker ကို စနစ်တကျ Register လုပ်ခြင်း
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker Registered Successfully!'))
        .catch(err => console.log('Service Worker Registration Failed:', err));
    });
}

// မြန်မာဂဏန်းများကို အင်္ဂလိပ်ဂဏန်းသို့ Auto ပြောင်းပေးသည့်စနစ်
function convertMyanmarToEnglishDigits(input) {
    if(!input) return "";
    const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return input.toString().replace(/[၀-၉]/g, (ch) => myanmarDigits.indexOf(ch));
}

// 💡 ဖုန်းတွေမှာ CORS Error မတက်အောင် Request ပို့တဲ့အခါ သုံးရမယ့် Standard Function
function sendToGoogleSheets(data, callback, errorCallback) {
    fetch(google_script_url, {
        method: "POST",
        mode: "no-cors", // ဖုန်း Browser တွေမှာ Block မဖြစ်အောင် no-cors သုံးထားပါတယ်
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        // no-cors mode မှာ response အချက်အလက်ကို ဖတ်လို့မရပေမယ့် Data က ဆာဗာပေါ်ကို ရောက်သွားပါတယ်
        if (callback) callback({ status: "success", message: "ဒေတာ ပို့လွှတ်မှု အောင်မြင်သည်။" });
    })
    .catch(err => {
        console.error("Network Error:", err);
        if (errorCallback) errorCallback(err);
    });
}
