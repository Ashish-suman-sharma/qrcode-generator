// DOM elements
const qrCodeDiv = document.getElementById('qr-code');
const urlInput = document.getElementById('url-input');
const textInput = document.getElementById('text-input');
const contactNameInput = document.getElementById('contact-name');
const contactEmailInput = document.getElementById('contact-email');
const contactPhoneInput = document.getElementById('contact-phone');
const contactAddressInput = document.getElementById('contact-address');
const wifiSsidInput = document.getElementById('wifi-ssid');
const wifiPasswordInput = document.getElementById('wifi-password');
const wifiEncryptionSelect = document.getElementById('wifi-encryption');
const wifiHiddenCheckbox = document.getElementById('wifi-hidden');
const qrSizeSelect = document.getElementById('qr-size');
const qrColorInput = document.getElementById('qr-color');
const qrBgColorInput = document.getElementById('qr-bg-color');
const errorCorrectionSelect = document.getElementById('error-correction');
const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadPngBtn = document.getElementById('download-png');
const downloadSvgBtn = document.getElementById('download-svg');
const downloadPdfBtn = document.getElementById('download-pdf');
const shareBtn = document.getElementById('share-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// QRious instance
let qr = new QRious({
    element: document.createElement('canvas'),
    size: 300,
    value: '',
    background: '#ffffff',
    foreground: '#000000',
    level: 'M', // Error correction level
});

// Current active tab
let activeTab = 'url';

// Initialize QR placeholder
qrCodeDiv.innerHTML = `
    <div class="placeholder">
        <i class="fas fa-qrcode"></i>
        <p>Your QR code will appear here</p>
    </div>
`;

// Tab switching functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => {
            if (content.dataset.tab === activeTab) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    });
});

// Generate QR code
function generateQRCode() {
    let qrValue = '';
    
    // Get value based on active tab
    switch (activeTab) {
        case 'url':
            qrValue = urlInput.value.trim();
            if (!qrValue) {
                showToast('Please enter a valid URL');
                return;
            }
            // Add http:// if not present
            if (!/^https?:\/\//i.test(qrValue)) {
                qrValue = 'https://' + qrValue;
            }
            break;
            
        case 'text':
            qrValue = textInput.value.trim();
            if (!qrValue) {
                showToast('Please enter some text');
                return;
            }
            break;
            
        case 'contact':
            const name = contactNameInput.value.trim();
            const email = contactEmailInput.value.trim();
            const phone = contactPhoneInput.value.trim();
            const address = contactAddressInput.value.trim();
            
            if (!name && !email && !phone) {
                showToast('Please enter at least name, email or phone');
                return;
            }
            
            // Generate vCard format
            qrValue = 'BEGIN:VCARD\nVERSION:3.0\n';
            if (name) qrValue += `FN:${name}\n`;
            if (email) qrValue += `EMAIL:${email}\n`;
            if (phone) qrValue += `TEL:${phone}\n`;
            if (address) qrValue += `ADR:;;${address};;;\n`;
            qrValue += 'END:VCARD';
            break;
            
        case 'wifi':
            const ssid = wifiSsidInput.value.trim();
            const password = wifiPasswordInput.value;
            const encryption = wifiEncryptionSelect.value;
            const hidden = wifiHiddenCheckbox.checked;
            
            if (!ssid) {
                showToast('Please enter network name (SSID)');
                return;
            }
            
            // Generate WiFi format
            qrValue = `WIFI:S:${ssid};`;
            if (encryption !== 'nopass') qrValue += `T:${encryption};`;
            if (password && encryption !== 'nopass') qrValue += `P:${password};`;
            if (hidden) qrValue += 'H:true;';
            qrValue += ';';
            break;
    }
    
    if (!qrValue) {
        showToast('Please enter valid data');
        return;
    }
    
    // Generate QR code
    qr.set({
        value: qrValue,
        size: parseInt(qrSizeSelect.value),
        foreground: qrColorInput.value,
        background: qrBgColorInput.value,
        level: errorCorrectionSelect.value
    });
      // Display QR code
    qrCodeDiv.innerHTML = '';
    const qrImage = new Image();
    qrImage.src = qr.toDataURL('image/png');
    qrCodeDiv.appendChild(qrImage);
    
    // Add animation effect
    qrImage.style.opacity = '0';
    qrImage.onload = () => {
        qrImage.style.transition = 'opacity 0.5s';
        qrImage.style.opacity = '1';
        
        // Scroll to make download buttons visible after QR code loads
        setTimeout(() => {
            const downloadOptions = document.querySelector('.download-options');
            downloadOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    };
    
    // Display download buttons
    enableDownloadButtons(true);
    
    // Add pulse animation to download section
    const downloadOptions = document.querySelector('.download-options');
    downloadOptions.classList.add('pulse');
    setTimeout(() => {
        downloadOptions.classList.remove('pulse');
    }, 1000);
    
    showToast('QR Code generated successfully!');
}

// Reset all inputs
function resetForm() {
    // Reset all inputs based on current tab
    switch (activeTab) {
        case 'url':
            urlInput.value = '';
            break;
        case 'text':
            textInput.value = '';
            break;
        case 'contact':
            contactNameInput.value = '';
            contactEmailInput.value = '';
            contactPhoneInput.value = '';
            contactAddressInput.value = '';
            break;
        case 'wifi':
            wifiSsidInput.value = '';
            wifiPasswordInput.value = '';
            wifiEncryptionSelect.value = 'WPA';
            wifiHiddenCheckbox.checked = false;
            break;
    }
    
    // Reset QR code placeholder
    qrCodeDiv.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-qrcode"></i>
            <p>Your QR code will appear here</p>
        </div>
    `;
    
    // Disable download buttons
    enableDownloadButtons(false);
}

// Download functions
function downloadQRAsPNG() {
    if (!isQRGenerated()) {
        showToast('Please generate a QR code first');
        return;
    }
    
    const link = document.createElement('a');
    link.href = qr.toDataURL('image/png');
    link.download = `qrcode-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('QR Code downloaded as PNG');
}

function downloadQRAsSVG() {
    if (!isQRGenerated()) {
        showToast('Please generate a QR code first');
        return;
    }
    
    const canvas = qr.canvas;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const size = qr.size;
    
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    
    const background = document.createElementNS(svgNS, "rect");
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", qr.background);
    svg.appendChild(background);
    
    const moduleSize = size / qr.canvas.width;
    const data = qr._qr.modules;
    
    for (let row = 0; row < data.length; row++) {
        for (let col = 0; col < data.length; col++) {
            if (data[row][col]) {
                const rect = document.createElementNS(svgNS, "rect");
                rect.setAttribute("x", col * moduleSize);
                rect.setAttribute("y", row * moduleSize);
                rect.setAttribute("width", moduleSize);
                rect.setAttribute("height", moduleSize);
                rect.setAttribute("fill", qr.foreground);
                svg.appendChild(rect);
            }
        }
    }
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-${new Date().getTime()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('QR Code downloaded as SVG');
}

function downloadQRAsPDF() {
    if (!isQRGenerated()) {
        showToast('Please generate a QR code first');
        return;
    }
    
    // Use jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
    });
    
    const imgData = qr.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const qrSize = Math.min(pdfWidth, pdfHeight) * 0.8;
    const x = (pdfWidth - qrSize) / 2;
    const y = 20;
    
    pdf.setFontSize(18);
    pdf.text('Your QR Code', pdfWidth / 2, 10, { align: 'center' });
    pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
    
    let qrContent = '';
    switch (activeTab) {
        case 'url':
            qrContent = urlInput.value;
            break;
        case 'text':
            qrContent = textInput.value;
            break;
        case 'contact':
            qrContent = `${contactNameInput.value} - ${contactEmailInput.value} - ${contactPhoneInput.value}`;
            break;
        case 'wifi':
            qrContent = `WIFI: ${wifiSsidInput.value}`;
            break;
    }
    
    pdf.setFontSize(12);
    pdf.text(`Content: ${qrContent.substring(0, 50)}${qrContent.length > 50 ? '...' : ''}`, 
             pdfWidth / 2, y + qrSize + 10, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pdfWidth / 2, y + qrSize + 16, { align: 'center' });
    
    pdf.save(`qrcode-${new Date().getTime()}.pdf`);
    showToast('QR Code downloaded as PDF');
}

// Share QR code
async function shareQRCode() {
    if (!isQRGenerated()) {
        showToast('Please generate a QR code first');
        return;
    }
    
    if (!navigator.share) {
        showToast('Your browser doesn\'t support sharing');
        return;
    }
    
    try {
        const blob = await (await fetch(qr.toDataURL('image/png'))).blob();
        const file = new File([blob], 'qrcode.png', {type: 'image/png'});
        
        await navigator.share({
            title: 'QR Code',
            text: 'Check out this QR Code I generated!',
            files: [file]
        });
        
        showToast('QR Code shared successfully!');
    } catch (error) {
        if (error.name !== 'AbortError') {
            showToast('Error sharing QR Code');
            console.error('Error sharing:', error);
        }
    }
}

// Helper functions
function isQRGenerated() {
    return qrCodeDiv.querySelector('img') !== null;
}

function enableDownloadButtons(enabled) {
    const buttons = [downloadPngBtn, downloadSvgBtn, downloadPdfBtn, shareBtn];
    buttons.forEach(btn => {
        if (enabled) {
            btn.removeAttribute('disabled');
            btn.style.opacity = '1';
        } else {
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = '0.5';
        }
    });
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event listeners
generateBtn.addEventListener('click', generateQRCode);
resetBtn.addEventListener('click', resetForm);
downloadPngBtn.addEventListener('click', downloadQRAsPNG);
downloadSvgBtn.addEventListener('click', downloadQRAsSVG);
downloadPdfBtn.addEventListener('click', downloadQRAsPDF);
shareBtn.addEventListener('click', shareQRCode);

// Input events for auto-generation (optional)
[urlInput, textInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });
});

// Handle large QR codes - ensure visibility of download buttons
function ensureDownloadButtonsVisible() {
    const qrContainer = document.getElementById('qr-code-container');
    const downloadOptions = document.querySelector('.download-options');
    
    // If QR container height exceeds a certain threshold, make it scrollable
    if (qrContainer.scrollHeight > 400) {
        qrContainer.style.maxHeight = '400px';
        qrContainer.style.overflowY = 'auto';
    } else {
        qrContainer.style.overflowY = 'visible';
    }
    
    // Make sure download options are visible
    setTimeout(() => {
        window.scrollTo({
            top: downloadOptions.offsetTop - 20,
            behavior: 'smooth'
        });
    }, 300);
}

// Observe QR code container for changes to handle large QR codes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // When a new QR code image is added
            if (mutation.addedNodes[0].tagName === 'IMG') {
                ensureDownloadButtonsVisible();
            }
        }
    });
});

// Start observing QR code container for changes
observer.observe(document.getElementById('qr-code'), { 
    childList: true,
    subtree: true 
});

// Initialize
enableDownloadButtons(false);
