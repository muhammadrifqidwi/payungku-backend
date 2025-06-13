function renderResetPasswordEmail(
  code,
  redirectUrl = "https://payungku.com/reset-password"
) {
  return `
  <!DOCTYPE html>
  <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Reset Password - PayungKu</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #ffffff;
          text-align: center;
          padding: 40px 20px;
          position: relative;
        }
        .email-header::before {
          content: '☂️';
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
        .email-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .email-header p {
          font-size: 16px;
          opacity: 0.9;
        }
        .email-body {
          padding: 40px 32px;
          color: #374151;
          line-height: 1.6;
        }
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 24px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 32px;
        }
        .otp-container {
          text-align: center;
          margin: 32px 0;
        }
        .otp-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 20px 32px;
          border-radius: 12px;
          display: inline-block;
          letter-spacing: 8px;
          color: #1f2937;
          border: 2px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .timer-info {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
          text-align: center;
        }
        .timer-info .icon {
          font-size: 20px;
          margin-bottom: 8px;
        }
        .timer-info .text {
          font-size: 14px;
          color: #92400e;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }
        .security-note {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 16px;
          margin: 24px 0;
          border-radius: 0 8px 8px 0;
        }
        .security-note .icon {
          color: #0ea5e9;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .security-note .text {
          font-size: 14px;
          color: #0c4a6e;
        }
        .email-footer {
          background: #f9fafb;
          text-align: center;
          padding: 32px 20px;
          border-top: 1px solid #e5e7eb;
        }
        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 16px;
        }
        .footer-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        .social-links {
          margin: 16px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .email-body {
            padding: 24px 20px;
          }
          .otp-code {
            font-size: 28px;
            letter-spacing: 4px;
            padding: 16px 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>PayungKu</h1>
          <p>Reset Kata Sandi Anda</p>
        </div>
        <div class="email-body">
          <div class="greeting">Halo, Pengguna PayungKu!</div>
          <div class="message">
            Kami menerima permintaan untuk mereset kata sandi akun PayungKu Anda. 
            Gunakan kode verifikasi di bawah ini untuk melanjutkan proses reset password.
          </div>
          
          <div class="otp-container">
            <div class="otp-label">Kode Verifikasi</div>
            <div class="otp-code">${code}</div>
          </div>

          <div class="timer-info">
            <div class="icon">⏰</div>
            <div class="text">Kode ini akan kedaluwarsa dalam 5 menit</div>
          </div>

          <div style="text-align: center;">
            <a class="cta-button" href="${redirectUrl}">Reset Password Sekarang</a>
          </div>

          <div class="security-note">
            <div class="icon">🔒</div>
            <div class="text">
              <strong>Catatan Keamanan:</strong><br>
              • Jangan bagikan kode ini kepada siapa pun<br>
              • Tim PayungKu tidak akan pernah meminta kode verifikasi Anda<br>
              • Jika Anda tidak meminta reset password, abaikan email ini
            </div>
          </div>
        </div>
        <div class="email-footer">
          <div class="footer-logo">☂️ PayungKu</div>
          <div class="footer-text">
            Solusi sewa payung terpercaya untuk kebutuhan Anda
          </div>
          <div class="social-links">
            <a href="#">Bantuan</a> • 
            <a href="#">Kebijakan Privasi</a> • 
            <a href="#">Syarat & Ketentuan</a>
          </div>
          <div class="footer-text">
            &copy; 2025 PayungKu. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

function renderWelcomeEmail(name = "Pengguna") {
  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Selamat Datang di PayungKu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-align: center;
            padding: 40px 20px;
            position: relative;
          }
          .email-header::before {
            content: '🎉';
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
          }
          .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .email-header p {
            font-size: 16px;
            opacity: 0.9;
          }
          .email-body {
            padding: 40px 32px;
            color: #374151;
            line-height: 1.6;
          }
          .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 24px;
            text-align: center;
          }
          .welcome-message {
            font-size: 16px;
            margin-bottom: 32px;
            text-align: center;
            color: #6b7280;
          }
          .cta-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
          }
          .cta-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 16px 8px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          .cta-button.secondary {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          .email-footer {
            background: #f9fafb;
            text-align: center;
            padding: 32px 20px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo {
            font-size: 24px;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 16px;
          }
          .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
          }
          .social-links {
            margin: 16px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
          }
          @media (max-width: 600px) {
            .email-body {
              padding: 24px 20px;
            }
            .features-grid {
              grid-template-columns: 1fr;
            }
            .cta-button {
              display: block;
              margin: 8px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>PayungKu</h1>
            <p>Selamat Datang di Keluarga PayungKu!</p>
          </div>
          <div class="email-body">
            <div class="greeting">Halo, ${name}! 👋</div>
            <div class="welcome-message">
              Terima kasih telah bergabung dengan PayungKu. Kami sangat senang bisa membantu 
              Anda mendapatkan perlindungan dari hujan kapan saja dan di mana saja!
            </div>

            <div class="cta-section">
              <div class="cta-title">Siap untuk memulai?</div>
              <a class="cta-button" href="https://payungku.com/locations">Cari Lokasi Terdekat</a>
              <a class="cta-button secondary" href="https://payungku.com/how-it-works">Pelajari Cara Kerja</a>
            </div>
          </div>
          <div class="email-footer">
            <div class="footer-logo">☂️ PayungKu</div>
            <div class="footer-text">
              Solusi sewa payung terpercaya untuk kebutuhan Anda
            </div>
            <div class="social-links">
              <a href="#">Bantuan</a> • 
              <a href="#">Kebijakan Privasi</a> • 
              <a href="#">Syarat & Ketentuan</a>
            </div>
            <div class="footer-text">
              &copy; 2025 PayungKu. Seluruh hak cipta dilindungi.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderRentalConfirmationEmail(rentalData) {
  const {
    userName = "Pengguna",
    rentalId,
    locationName,
    startTime,
    duration,
    totalCost,
    qrCode,
  } = rentalData;

  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Konfirmasi Sewa Payung - PayungKu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-align: center;
            padding: 40px 20px;
          }
          .email-header::before {
            content: '✅';
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
          }
          .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .email-body {
            padding: 40px 32px;
            color: #374151;
            line-height: 1.6;
          }
          .rental-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          .rental-id {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            text-align: center;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            color: #1f2937;
          }
          .qr-section {
            text-align: center;
            margin: 32px 0;
            padding: 24px;
            background: #ffffff;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
          }
          .instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
          }
          @media (max-width: 600px) {
            .email-body {
              padding: 24px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Sewa Berhasil!</h1>
            <p>Payung Anda siap digunakan</p>
          </div>
          <div class="email-body">
            <p>Halo ${userName},</p>
            <p>Terima kasih telah menggunakan layanan PayungKu. Berikut adalah detail sewa payung Anda:</p>
            
            <div class="rental-card">
              <div class="rental-id">ID Sewa: ${rentalId}</div>
              <div class="detail-row">
                <span>Lokasi:</span>
                <span>${locationName}</span>
              </div>
              <div class="detail-row">
                <span>Waktu Mulai:</span>
                <span>${startTime}</span>
              </div>
              <div class="detail-row">
                <span>Durasi:</span>
                <span>${duration}</span>
              </div>
              <div class="detail-row">
                <span>Total Biaya:</span>
                <span>Rp ${totalCost}</span>
              </div>
            </div>

            ${
              qrCode
                ? `
            <div class="qr-section">
              <h3>QR Code untuk Pengembalian</h3>
              <img src="${qrCode}" alt="QR Code" style="max-width: 200px; margin: 16px 0;" />
              <p style="font-size: 14px; color: #6b7280;">Simpan QR code ini untuk pengembalian payung</p>
            </div>
            `
                : ""
            }

            <div class="instructions">
              <h4 style="margin-bottom: 12px;">📋 Instruksi Penting:</h4>
              <ul style="margin-left: 20px;">
                <li>Ambil payung dari loker yang telah terbuka</li>
                <li>Gunakan payung dengan hati-hati</li>
                <li>Kembalikan payung ke lokasi PayungKu mana saja</li>
                <li>Scan QR code saat pengembalian</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderReturnConfirmationEmail(returnData) {
  const {
    userName = "Pengguna",
    rentalId,
    returnLocation,
    returnTime,
    totalDuration,
    finalCost,
    lateFee = 0,
  } = returnData;

  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Konfirmasi Pengembalian - PayungKu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: #ffffff;
            text-align: center;
            padding: 40px 20px;
          }
          .email-header::before {
            content: '🎯';
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
          }
          .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .email-body {
            padding: 40px 32px;
            color: #374151;
            line-height: 1.6;
          }
          .return-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            color: #1f2937;
          }
          .late-fee {
            color: #dc2626;
            font-weight: 600;
          }
          .thank-you {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
          }
          @media (max-width: 600px) {
            .email-body {
              padding: 24px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Pengembalian Berhasil!</h1>
            <p>Terima kasih telah menggunakan PayungKu</p>
          </div>
          <div class="email-body">
            <p>Halo ${userName},</p>
            <p>Payung telah berhasil dikembalikan. Berikut adalah ringkasan sewa Anda:</p>
            
            <div class="return-card">
              <div class="detail-row">
                <span>ID Sewa:</span>
                <span>${rentalId}</span>
              </div>
              <div class="detail-row">
                <span>Lokasi Pengembalian:</span>
                <span>${returnLocation}</span>
              </div>
              <div class="detail-row">
                <span>Waktu Pengembalian:</span>
                <span>${returnTime}</span>
              </div>
              <div class="detail-row">
                <span>Total Durasi:</span>
                <span>${totalDuration}</span>
              </div>
              ${
                lateFee > 0
                  ? `
              <div class="detail-row">
                <span>Denda Keterlambatan:</span>
                <span class="late-fee">Rp ${lateFee}</span>
              </div>
              `
                  : ""
              }
              <div class="detail-row">
                <span>Total Biaya:</span>
                <span>Rp ${finalCost}</span>
              </div>
            </div>

            <div class="thank-you">
              <h3 style="margin-bottom: 16px;">🙏 Terima Kasih!</h3>
              <p>Kami berharap PayungKu telah membantu melindungi Anda dari hujan. 
              Jangan ragu untuk menggunakan layanan kami lagi di lain waktu!</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = {
  renderResetPasswordEmail,
  renderWelcomeEmail,
  renderRentalConfirmationEmail,
  renderReturnConfirmationEmail,
};
