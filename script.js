const textInput = document.getElementById('text-input');
const qrCodeDiv = document.getElementById('qr-code');
const downloadButton = document.getElementById('download-button');
const qr = new QRious();

textInput.addEventListener('input', () => {
    const text = textInput.value;

    if (text) {
        qr.set({
            value: text,
            size: 200,
        });
        qrCodeDiv.innerHTML = '';
        const qrImage = new Image();
        qrImage.src = qr.toDataURL('image/png');
        qrCodeDiv.appendChild(qrImage);

        // Show the download button when a QR code is generated
        downloadButton.style.display = 'block';
        downloadButton.href = qrImage.src; // Set the download link

        // Update the download button's download attribute with a default file name
        downloadButton.download = 'qrcode.png';
    } else {
        qrCodeDiv.innerHTML = '';

        // Hide the download button when no text is entered
        downloadButton.style.display = 'none';
    }
});

downloadButton.addEventListener('click', () => {
    if (!qr.toDataURL()) {
        // QR code is not generated; prevent the download
        alert('Please generate a QR code first.');
        return;
    }

    // Prompt the user to specify the download path and file name
    const fileName = prompt('Enter the file name (including the extension):', 'qrcode.png');
    if (fileName) {
        downloadButton.download = fileName;
    } else {
        alert('Download canceled. Please specify a file name.');
    }
});
