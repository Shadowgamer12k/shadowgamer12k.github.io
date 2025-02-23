// تخزين الروابط المختصرة في localStorage (بديل عن قاعدة البيانات)
let linksDB = JSON.parse(localStorage.getItem("linksDB")) || {};

// توليد رابط مختصر عشوائي
function generateShortCode() {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let shortCode = "";
    for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return shortCode;
}

// اختصار الرابط
function shortenLink() {
    let inputLink = document.getElementById("linkInput").value;
    if (!inputLink.startsWith("http")) {
        alert("يرجى إدخال رابط صحيح!");
        return;
    }

    let shortCode = generateShortCode();
    linksDB[shortCode] = inputLink;
    localStorage.setItem("linksDB", JSON.stringify(linksDB));

    let shortURL = window.location.origin + "/#" + shortCode;
    document.getElementById("shortenedLink").innerHTML = 
        `🔗 رابطك المختصر: <a href="${shortURL}" target="_blank">${shortURL}</a>`;
}

// عند فتح رابط مختصر، يتم التوجيه مع الإعلانات
window.onload = function() {
    let hash = window.location.hash.substring(1);
    if (hash && linksDB[hash]) {
        setTimeout(() => {
            window.open("https://your-ad-popup-link.com", "_blank"); // إعلان Popup
        }, 1000);

        setTimeout(() => {
            window.location.href = linksDB[hash]; // توجيه إلى الرابط الأصلي
        }, 5000); // بعد 5 ثوانٍ
    }
};
