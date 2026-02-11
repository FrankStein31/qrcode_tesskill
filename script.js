let html5QrCode;
let currentScannedId = null;
let countdownTimer = null;
let countdownSeconds = 30;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadQRList();
    
    // Initialize scanner only when scan tab is shown
    document.getElementById('scan-tab').addEventListener('shown.bs.tab', function() {
        if(!html5QrCode) {
            initScanner();
        }
    });
    
    // Cancel button handler
    document.getElementById('btnCancel').addEventListener('click', function() {
        resetForm();
    });
});

// Register QR Code
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const editId = document.getElementById('editId').value;
    
    // Check if it's edit mode
    if(editId) {
        formData.append('id', editId);
    }
    
    try {
        const action = editId ? 'update' : 'register';
        const response = await fetch(`api.php?action=${action}`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if(result.success) {
            const message = editId ? 'diupdate' : 'dibuat';
            document.getElementById('registerResult').innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="bi bi-check-circle"></i> QR Code berhasil ${message}!</h5>
                    <p>Code: <strong>${result.code}</strong></p>
                    ${result.qr_image ? `
                        <img src="${result.qr_image}" alt="QR Code" class="img-fluid qr-image-preview">
                        <div class="mt-3">
                            <a href="${result.qr_image}" download="${result.code}.png" class="btn btn-success">
                                <i class="bi bi-download"></i> Download QR Code
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
            resetForm();
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
    
    // Check if accessing via HTTPS or localhost
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext && !isLocalhost) {
        document.getElementById('reader').innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="bi bi-exclamation-triangle"></i> Kamera Memerlukan HTTPS</h5>
                <p><strong>Browser memblokir akses kamera karena koneksi tidak aman.</strong></p>
                <hr>
                <p class="mb-2"><strong>Solusi untuk HP/Mobile:</strong></p>
                <ol class="text-start">
                    <li>Gunakan HTTPS atau aktifkan SSL di Laragon</li>
                    <li>Atau gunakan aplikasi berbasis file (bukan browser)</li>
                    <li>Atau test di localhost dari PC server</li>
                </ol>
                <hr>
                <p class="mb-0"><small><i class="bi bi-info-circle"></i> Alternatif: Upload foto QR Code secara manual</small></p>
            </div>
        `;
        return;
    }
    
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
        
        let errorMessage = '';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = `
                <div class="alert alert-warning">
                    <h5><i class="bi bi-camera-video-off"></i> Izin Kamera Ditolak</h5>
                    <p><strong>Anda belum memberikan izin akses kamera.</strong></p>
                    <hr>
                    <p class="mb-2"><strong>Cara mengaktifkan:</strong></p>
                    <ol class="text-start">
                        <li><strong>Android Chrome:</strong> Klik ikon gembok di address bar → Izinkan kamera</li>
                        <li><strong>iPhone Safari:</strong> Settings → Safari → Camera → Allow</li>
                        <li><strong>Desktop:</strong> Klik ikon kamera di address bar → Allow</li>
                    </ol>
                    <hr>
                    <button class="btn btn-primary btn-sm" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Refresh & Coba Lagi
                    </button>
                </div>
            `;
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = `
                <div class="alert alert-danger">
                    <h5><i class="bi bi-camera-video-off"></i> Kamera Tidak Ditemukan</h5>
                    <p>Perangkat Anda tidak memiliki kamera atau kamera sedang digunakan aplikasi lain.</p>
                </div>
            `;
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage = `
                <div class="alert alert-warning">
                    <h5><i class="bi bi-exclamation-triangle"></i> Kamera Sedang Digunakan</h5>
                    <p>Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan refresh halaman ini.</p>
                    <hr>
                    <button class="btn btn-primary btn-sm" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Refresh Halaman
                    </button>
                </div>
            `;
        } else {
            errorMessage = `
                <div class="alert alert-danger">
                    <h5><i class="bi bi-exclamation-triangle"></i> Error Kamera</h5>
                    <p><strong>Tidak dapat mengakses kamera.</strong></p>
                    <p class="mb-0"><small>Error: ${err.message || err.name || 'Unknown error'}</small></p>
                    <hr>
                    <p class="mb-2"><strong>Pastikan:</strong></p>
                    <ul class="text-start">
                        <li>Browser memiliki izin akses kamera</li>
                        <li>Koneksi menggunakan HTTPS (untuk IP selain localhost)</li>
                        <li>Kamera tidak sedang digunakan aplikasi lain</li>
                    </ul>
                </div>
            `;
        }
        
        document.getElementById('reader').innerHTML = errorMessage;
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

// Reset Form
function resetForm() {
    document.getElementById('registerForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('btnText').textContent = 'Generate QR Code';
    document.getElementById('btnSubmit').innerHTML = '<i class="bi bi-qr-code"></i> <span id="btnText">Generate QR Code</span>';
    document.getElementById('btnCancel').style.display = 'none';
    document.getElementById('registerResult').innerHTML = '';
}

// Edit QR Code
function editQRCode(id, name, description) {
    // Handle undefined/null values
    name = name || '';
    description = description || '';
    
    document.getElementById('editId').value = id;
    document.getElementById('qrName').value = name;
    document.getElementById('qrDescription').value = description;
    document.getElementById('btnText').textContent = 'Update QR Code';
    document.getElementById('btnSubmit').innerHTML = '<i class="bi bi-pencil"></i> <span id="btnText">Update QR Code</span>';
    document.getElementById('btnCancel').style.display = 'block';
    
    // Scroll to form
    document.querySelector('#registerForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete QR Code
async function deleteQRCode(id, name) {
    if(!confirm(`Apakah Anda yakin ingin menghapus QR Code "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch('api.php?action=delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if(result.success) {
            alert('QR Code berhasil dihapus!');
            loadQRList();
        } else {
            alert('Gagal menghapus QR Code: ' + result.message);
        }
    } catch(error) {
        console.error('Delete error:', error);
        alert('Terjadi kesalahan saat menghapus QR Code');
    }
}

// View QR Code Detail
function viewQRCode(id, code, name, description, qrImage, scannedAt, isUsed) {
    // Debug log
    console.log('viewQRCode called with:', {
        id, code, name, description, qrImage, scannedAt, isUsed
    });
    
    // Handle undefined/null values
    code = code || '';
    name = name || 'N/A';
    description = description || '-';
    qrImage = qrImage || '';
    scannedAt = scannedAt || '';
    
    // Check if qrImage is valid
    if(!qrImage || qrImage === '' || qrImage === 'undefined' || qrImage === 'null') {
        console.error('QR Image not valid:', qrImage);
    }
    
    const status = isUsed == 1 ? 
        '<span class="badge bg-warning">Digunakan</span>' : 
        scannedAt ? 
        '<span class="badge bg-success">Di-scan</span>' :
        '<span class="badge bg-secondary">Belum Di-scan</span>';
    
    const modal = `
        <div class="modal fade" id="qrModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <h5 class="modal-title"><i class="bi bi-qr-code-scan"></i> Detail QR Code</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        ${qrImage && qrImage !== '' && qrImage !== 'undefined' && qrImage !== 'null' ? 
                            `<img src="${qrImage}" alt="QR Code" class="img-fluid mb-3" style="max-width: 300px;" onerror="this.onerror=null; this.src=''; this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <p class="text-muted" style="display:none;">Gagal memuat gambar QR Code</p>` : 
                            '<p class="text-muted">QR Code image not available</p>'}
                        <h4>${name}</h4>
                        <p class="text-muted">${description}</p>
                        <p><strong>Code:</strong> ${code}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        ${scannedAt && scannedAt !== 'null' && scannedAt !== '' ? `<p><strong>Waktu Scan:</strong> ${scannedAt}</p>` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('qrModal');
    if(existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modal);
    const modalElement = new bootstrap.Modal(document.getElementById('qrModal'));
    modalElement.show();
    
    // Remove modal from DOM after hide
    document.getElementById('qrModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Load QR Code List
async function loadQRList() {
    try {
        const response = await fetch('api.php?action=list');
        const result = await response.json();
        
        if(result.success) {
            let html = '<div class="list-group">';
            
            result.data.forEach(qr => {
                // Debug: Log the actual QR data
                console.log('QR Data from API:', qr);
                
                const statusBadge = qr.is_used == 1 ? 
                    '<span class="badge bg-warning badge-status">Digunakan</span>' : 
                    qr.scanned_at ? 
                    '<span class="badge bg-success badge-status">Di-scan</span>' :
                    '<span class="badge bg-secondary badge-status">Belum Di-scan</span>';
                
                // Escape quotes and handle null values
                const safeName = (qr.name || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
                const safeDescription = (qr.description || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
                const safeCode = (qr.code || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
                const safeImage = qr.qr_image || '';
                const safeScannedAt = qr.scanned_at || '';
                
                // Debug: Check the safe values
                console.log('Safe values:', { safeName, safeDescription, safeCode, safeImage, safeScannedAt });
                
                html += `
                    <div class="list-group-item qr-item mb-2">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex align-items-center flex-grow-1">
                                <div class="me-3">
                                    ${safeImage ? `<img src="${safeImage}" alt="QR Code" class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover;">` : '<div class="bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 5px;"><i class="bi bi-qr-code"></i></div>'}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1"><i class="bi bi-tag"></i> ${qr.name}</h6>
                                    <p class="mb-1 text-muted small">${qr.description || '-'}</p>
                                    <small class="text-muted">
                                        <i class="bi bi-key"></i> Code: ${qr.code}
                                    </small>
                                </div>
                            </div>
                            <div class="text-end ms-3">
                                ${statusBadge}
                                <br>
                                <small class="text-muted d-block mb-2">${qr.created_at}</small>
                                <div class="qr-actions">
                                    ${!qr.scanned_at && qr.is_used == 0 ? `
                                        <a href="${safeImage}" download="${safeCode}.png" class="btn btn-sm btn-success btn-action" title="Download">
                                            <i class="bi bi-download"></i>
                                        </a>
                                        <button class="btn btn-sm btn-info btn-action" onclick='viewQRCode(${qr.id}, "${safeCode}", "${safeName}", "${safeDescription}", "${safeImage}", "${safeScannedAt}", ${qr.is_used})' title="Lihat">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-warning btn-action" onclick='editQRCode(${qr.id}, "${safeName}", "${safeDescription}")' title="Edit">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-danger btn-action" onclick='deleteQRCode(${qr.id}, "${safeName}")' title="Hapus">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
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
