let html5QrCode;
let currentScannedId = null;
let countdownTimer = null;
let countdownSeconds = 30;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadQRList();
    initScanner();
});

// Register QR Code
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    try {
        const response = await fetch('api.php?action=register', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if(result.success) {
            document.getElementById('registerResult').innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="bi bi-check-circle"></i> QR Code berhasil dibuat!</h5>
                    <p>Code: <strong>${result.code}</strong></p>
                    <img src="${result.qr_image}" alt="QR Code" class="img-fluid mt-2">
                </div>
            `;
            this.reset();
            loadQRList();
        } else {
            document.getElementById('registerResult').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${result.message}
                </div>
            `;
        }
    } catch(error) {
        console.error('Error:', error);
    }
});

// Initialize Scanner
function initScanner() {
    html5QrCode = new Html5Qrcode("reader");
    
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
    ).catch(err => {
        console.error("Camera error:", err);
        document.getElementById('reader').innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-camera-video-off"></i> Tidak dapat mengakses kamera. 
                Pastikan Anda memberikan izin kamera.
            </div>
        `;
    });
}

// On Scan Success
async function onScanSuccess(decodedText, decodedResult) {
    if(currentScannedId !== null) {
        return; // Prevent multiple scans during countdown
    }
    
    console.log('QR Code detected:', decodedText);
    
    try {
        const response = await fetch('api.php?action=scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: decodedText })
        });
        
        const result = await response.json();
        console.log('Scan result:', result);
        
        if(result.success) {
            currentScannedId = result.id;
            
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="bi bi-check-circle"></i> Scan berhasil!</h5>
                    <p><strong>Nama:</strong> ${result.name}</p>
                    <p><strong>Deskripsi:</strong> ${result.description}</p>
                    <p><strong>Waktu Scan:</strong> ${result.scanned_at || 'Baru saja'}</p>
                </div>
            `;
            
            // Refresh list immediately after scan
            await loadQRList();
            
            // Start countdown timer - after 30 seconds, QR Code will be marked as used
            startCountdown();
        } else {
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${result.message}
                </div>
            `;
        }
    } catch(error) {
        console.error('Scan error:', error);
        document.getElementById('scanResult').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Terjadi kesalahan saat scan
            </div>
        `;
    }
}

function onScanError(errorMessage) {
    // Silent error handling
}

// Countdown Timer
function startCountdown() {
    document.getElementById('countdown').style.display = 'block';
    countdownSeconds = 30;
    
    updateCountdownDisplay();
    
    countdownTimer = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if(countdownSeconds <= 0) {
            stopCountdown();
            markAsUsed();
        }
    }, 1000);
}

function updateCountdownDisplay() {
    document.getElementById('timer').textContent = countdownSeconds;
    document.getElementById('progressBar').textContent = countdownSeconds + 's';
    
    const percentage = (countdownSeconds / 30) * 100;
    document.getElementById('progressBar').style.width = percentage + '%';
    
    // Reset classes
    const progressBar = document.getElementById('progressBar');
    progressBar.classList.remove('bg-warning', 'bg-danger');
    
    if(countdownSeconds <= 10 && countdownSeconds > 5) {
        progressBar.classList.remove('bg-info');
        progressBar.classList.add('bg-warning');
    } else if(countdownSeconds <= 5) {
        progressBar.classList.remove('bg-info', 'bg-warning');
        progressBar.classList.add('bg-danger');
    } else {
        progressBar.classList.add('bg-info');
    }
}

function stopCountdown() {
    if(countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    document.getElementById('countdown').style.display = 'none';
    // Don't reset currentScannedId here, let markAsUsed() handle it
}

// Mark QR Code as Used after 30 seconds
async function markAsUsed() {
    if(currentScannedId === null) {
        console.log('No scanned ID to mark as used');
        return;
    }
    
    console.log('Timer habis! Marking as used, ID:', currentScannedId);
    
    try {
        const response = await fetch('api.php?action=markUsed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: currentScannedId })
        });
        
        const result = await response.json();
        console.log('Mark as used result:', result);
        
        if(result.success) {
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-info">
                    <h5><i class="bi bi-check-circle"></i> Timer 30 detik selesai!</h5>
                    <p>QR Code otomatis ditandai sebagai digunakan.</p>
                    <hr>
                    <p class="mb-0 text-center"><i class="bi bi-arrow-repeat"></i> <strong>Silakan scan QR Code lain</strong></p>
                </div>
            `;
            // Refresh list to show updated status
            await loadQRList();
        } else {
            console.error('Failed to mark as used:', result.message);
        }
    } catch(error) {
        console.error('Mark used error:', error);
    }
    
    currentScannedId = null;
}

// Load QR Code List
async function loadQRList() {
    try {
        const response = await fetch('api.php?action=list');
        const result = await response.json();
        
        if(result.success) {
            let html = '<div class="list-group">';
            
            result.data.forEach(qr => {
                const statusBadge = qr.is_used == 1 ? 
                    '<span class="badge bg-warning badge-status">Digunakan (40)</span>' : 
                    qr.scanned_at ? 
                    '<span class="badge bg-success badge-status">Di-scan (30)</span>' :
                    '<span class="badge bg-secondary badge-status">Belum Di-scan (30)</span>';
                
                html += `
                    <div class="list-group-item qr-item mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1"><i class="bi bi-qr-code"></i> ${qr.name}</h6>
                                <p class="mb-1 text-muted">${qr.description || '-'}</p>
                                <small class="text-muted">
                                    <i class="bi bi-key"></i> Code: ${qr.code}
                                </small>
                            </div>
                            <div class="text-end">
                                ${statusBadge}
                                <br>
                                <small class="text-muted">${qr.created_at}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            
            if(result.data.length === 0) {
                html = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> Belum ada QR Code terdaftar.</div>';
            }
            
            document.getElementById('qrList').innerHTML = html;
        }
    } catch(error) {
        console.error('Load list error:', error);
    }
}
