// config.js - Global Variables & Standard Network Setup
const google_script_url = "https://script.google.com/macros/s/XXXXX_သင့်လင့်ခ်အသစ်_XXXXX/exec"; 

let current_user_key = localStorage.getItem('logged_user_key') || "";
let current_acc_type = localStorage.getItem('logged_acc_type') || "";
let transactions = [];      
let unsynced_items = [];    
let pending_deletes = [];   

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}

function convertMyanmarToEnglishDigits(input) {
    if(!input) return "";
    const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return input.toString().replace(/[၀-၉]/g, (ch) => myanmarDigits.indexOf(ch));
}
