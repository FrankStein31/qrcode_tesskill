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
            max-width: 1400px;
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
            padding: 15px;
        }
        .qr-item:hover {
            transform: translateX(5px);
            background-color: #f8f9fa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .qr-item img.img-thumbnail {
            border: 2px solid #667eea;
            padding: 3px;
        }
        .badge-status {
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 600;
        }
        /* Tab Navigation Styles */
        .nav-pills .nav-link {
            border-radius: 50px;
            padding: 15px 30px;
            font-weight: 600;
            font-size: 1.1rem;
            color: white;
            background: rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        }
        .nav-pills .nav-link:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        .nav-pills .nav-link.active {
            background: white;
            color: #667eea;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        .qr-actions {
            display: flex;
            gap: 5px;
        }
        .btn-action {
            padding: 5px 10px;
            font-size: 0.875rem;
        }
        .qr-image-preview {
            max-width: 150px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="text-center mb-4">
            <h1 class="text-white mb-3"><i class="bi bi-qr-code-scan"></i> Sistem QR Code</h1>
            <p class="text-white">Kelola dan scan QR Code dengan mudah</p>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav nav-pills nav-fill mb-4" id="mainTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="manage-tab" data-bs-toggle="pill" data-bs-target="#manage" type="button" role="tab">
                    <i class="bi bi-list-ul"></i> Kelola QR Code
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="scan-tab" data-bs-toggle="pill" data-bs-target="#scan" type="button" role="tab">
                    <i class="bi bi-camera"></i> Scan QR Code
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="mainTabContent">
            <!-- Tab 1: Kelola QR Code -->
            <div class="tab-pane fade show active" id="manage" role="tabpanel">
                <div class="row">
                    <!-- Form Register QR Code -->
                    <div class="col-lg-5 mb-4">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="mb-0"><i class="bi bi-plus-circle"></i> Tambah QR Code</h4>
                            </div>
                            <div class="card-body">
                                <form id="registerForm">
                                    <div class="mb-3">
                                        <label class="form-label"><i class="bi bi-person"></i> Nama</label>
                                        <input type="text" class="form-control" name="name" id="qrName" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label"><i class="bi bi-info-circle"></i> Deskripsi</label>
                                        <textarea class="form-control" name="description" id="qrDescription" rows="3"></textarea>
                                    </div>
                                    <input type="hidden" name="editId" id="editId" value="">
                                    <button type="submit" class="btn btn-primary w-100" id="btnSubmit">
                                        <i class="bi bi-qr-code"></i> <span id="btnText">Generate QR Code</span>
                                    </button>
                                    <button type="button" class="btn btn-secondary w-100 mt-2" id="btnCancel" style="display:none;">
                                        <i class="bi bi-x-circle"></i> Batal
                                    </button>
                                </form>
                                <div id="registerResult" class="mt-3"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Daftar QR Code -->
                    <div class="col-lg-7 mb-4">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h4 class="mb-0"><i class="bi bi-list-check"></i> Daftar QR Code</h4>
                                <button class="btn btn-sm btn-light" onclick="loadQRList()">
                                    <i class="bi bi-arrow-clockwise"></i> Refresh
                                </button>
                            </div>
                            <div class="card-body">
                                <div id="qrList"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 2: Scan QR Code -->
            <div class="tab-pane fade" id="scan" role="tabpanel">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
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
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="script.js"></script>
</body>
</html>
