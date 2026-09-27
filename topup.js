// --- ระบบเติมเงินอัตโนมัติ (PromptPay QR) ---
const PROMPTPAY_NUMBER = "0933998364";

function openTopupModal() {
    const modal = document.getElementById('topupModalOverlay');
    const step1 = document.getElementById('topupStep1');
    const step2 = document.getElementById('topupStep2');
    const input = document.getElementById('topupAmountInput');
    
    if (modal) {
        modal.classList.add('active');
        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        if (input) input.value = '';
    }
}

function closeTopupModal() {
    const modal = document.getElementById('topupModalOverlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

function backToStep1() {
    document.getElementById('topupStep2').style.display = 'none';
    document.getElementById('topupStep1').style.display = 'block';
}

// ปิด Modal เมื่อคลิกพื้นที่ว่างด้านนอก
window.addEventListener('click', (e) => {
    const modal = document.getElementById('topupModalOverlay');
    if (e.target === modal) {
        closeTopupModal();
    }
});

function generatePromptPayPayload(mobile, amount) {
    let cleanId = mobile.replace(/[^0-9]/g, '');
    let targetType = cleanId.length >= 13 ? "02" : "01";
    if (cleanId.length === 10) cleanId = "0066" + cleanId.substring(1);

    let formattedTarget = targetType + ("00" + cleanId.length).slice(-2) + cleanId;
    let merchantAccount = "0016A000000677010111" + ("00" + formattedTarget.length).slice(-2) + formattedTarget;
    
    let formattedAmount = parseFloat(amount).toFixed(2);
    let amountField = "54" + ("00" + formattedAmount.length).slice(-2) + formattedAmount;

    let data = "000201" + "010211" + "2937" + merchantAccount + "5802TH" + "5303764" + amountField + "6304";
    let crc = crc16(data);
    return data + crc;
}

function crc16(text) {
    let crc = 0xFFFF;
    for (let c = 0; c < text.length; c++) {
        crc ^= text.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) { crc = (crc << 1) ^ 0x1021; } else { crc = crc << 1; }
        }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    return "0000".substr(0, 4 - hex.length) + hex;
}

function generateQRCodePromptPay() {
    const amountInput = document.getElementById('topupAmountInput');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        alert('❌ กรุณากรอกจำนวนเงินให้ถูกต้องครับ');
        return;
    }

    document.getElementById('displayTargetAmount').innerText = amount.toFixed(2);
    document.getElementById('topupStep1').style.display = 'none';
    document.getElementById('topupStep2').style.display = 'block';

    const qrPayload = generatePromptPayPayload(PROMPTPAY_NUMBER, amount);
    const container = document.getElementById('qrcodeContainer');
    container.innerHTML = "";

    new QRCode(container, {
        text: qrPayload,
        width: 190,
        height: 190,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
