// config.js - Global Variables & Service Worker Registration
const google_script_url = "https://script.google.com/macros/s/AKfycbzK2cpq8Ik09bA35BmjKIDVw1yFmQJ6KVQuGTpXuJznBwOQPuH4Y9LO5iGqOiPDI2C5/exec"; 

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
