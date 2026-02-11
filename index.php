<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .main-container {
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
        }
        .card {
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border: none;
        }
        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px 15px 0 0 !important;
            padding: 20px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 10px 30px;
            border-radius: 25px;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .qr-item {
            transition: all 0.3s ease;
            border-left: 4px solid #667eea;
        }
        .qr-item:hover {
            transform: translateX(5px);
            background-color: #f8f9fa;
        }
        .badge-status {
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="text-center mb-4">
            <h1 class="text-white mb-3"><i class="bi bi-qr-code-scan"></i> Sistem QR Code</h1>
            <p class="text-white">Kelola dan scan QR Code dengan mudah</p>
        </div>

        <div class="row">
            <!-- Form Register QR Code -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h4 class="mb-0"><i class="bi bi-plus-circle"></i> Register QR Code</h4>
                    </div>
                    <div class="card-body">
                        <form id="registerForm">
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-person"></i> Nama</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label"><i class="bi bi-info-circle"></i> Deskripsi</label>
                                <textarea class="form-control" name="description" rows="3"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-qr-code"></i> Generate QR Code
                            </button>
                        </form>
                        <div id="registerResult" class="mt-3"></div>
                    </div>
                </div>
            </div>

            <!-- Scanner QR Code -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h4 class="mb-0"><i class="bi bi-camera"></i> Scan QR Code</h4>
                    </div>
                    <div class="card-body">
                        <div id="reader" style="width: 100%;"></div>
                        <div id="scanResult" class="mt-3"></div>
                        <div id="countdown" class="mt-3 text-center" style="display:none;">
                            <h3 class="text-success">QR Code berhasil di-scan!</h3>
                            <p class="lead">Timer: <span id="timer" class="badge bg-info fs-4">30</span> detik</p>
                            <div class="progress" style="height: 30px;">
                                <div id="progressBar" class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" style="width: 100%">30s</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Daftar QR Code Terdaftar -->
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0"><i class="bi bi-list-check"></i> Daftar QR Code Terdaftar</h4>
            </div>
            <div class="card-body">
                <div id="qrList"></div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="script.js"></script>
</body>
</html>
