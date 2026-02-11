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
    
    try {
        const response = await fetch('api.php?action=scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: decodedText })
        });
        
        const result = await response.json();
        
        if(result.success) {
            currentScannedId = result.id;
            
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="bi bi-check-circle"></i> Scan berhasil!</h5>
                    <p><strong>Nama:</strong> ${result.name}</p>
                    <p><strong>Deskripsi:</strong> ${result.description}</p>
                    <p class="mb-0"><strong>Nilai:</strong> <span class="badge bg-success">30</span></p>
                </div>
            `;
            
            startCountdown();
            loadQRList();
        } else {
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${result.message}
                </div>
            `;
        }
    } catch(error) {
        console.error('Scan error:', error);
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
    
    if(countdownSeconds <= 10) {
        document.getElementById('progressBar').classList.remove('bg-info');
        document.getElementById('progressBar').classList.add('bg-warning');
    }
    
    if(countdownSeconds <= 5) {
        document.getElementById('progressBar').classList.remove('bg-warning');
        document.getElementById('progressBar').classList.add('bg-danger');
    }
}

function stopCountdown() {
    if(countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    document.getElementById('countdown').style.display = 'none';
    currentScannedId = null;
}

// Mark QR Code as Used
async function markAsUsed() {
    if(currentScannedId === null) return;
    
    try {
        const response = await fetch('api.php?action=markUsed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: currentScannedId })
        });
        
        const result = await response.json();
        
        if(result.success) {
            document.getElementById('scanResult').innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> QR Code otomatis ditandai sebagai digunakan setelah 30 detik.
                    <p class="mb-0"><strong>Nilai:</strong> <span class="badge bg-warning">40</span></p>
                </div>
            `;
            loadQRList();
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
