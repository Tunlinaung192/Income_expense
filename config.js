// config.js - Global Variables & Service Worker Registration
const google_script_url = "ဒီနေရာမှာ_သင်ရလာတဲ့_Google_Web_App_URL_အသစ်ကြီးကိုထည့်ပါ"; 

let current_user_key = localStorage.getItem('logged_user_key') || "";
let current_acc_type = localStorage.getItem('logged_acc_type') || "";
let transactions = [];      
let unsynced_items = [];    
let pending_deletes = [];   

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker Registered!'))
        .catch(err => console.log('Service Worker Registration Failed:', err));
    });
}

function convertMyanmarToEnglishDigits(input) {
    if(!input) return "";
    const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return input.toString().replace(/[၀-၉]/g, (ch) => myanmarDigits.indexOf(ch));
}