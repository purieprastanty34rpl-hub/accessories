# Setup Google Apps Script

## Langkah 1 — Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru
2. Beri nama sheet: `Sheet1`
3. Isi baris pertama (header) dengan kolom berikut:

| A  | B              | C     | D                | E            | F     | G     | H             | I          | J         |
|----|----------------|-------|------------------|--------------|-------|-------|---------------|------------|-----------|
| No | Nama Customer  | No HP | Jenis Aksesoris  | Nama Produk  | Brand | Harga | Tanggal Pesan | Keterangan | Timestamp |

---

## Langkah 2 — Buat Google Apps Script

1. Di spreadsheet, klik **Extensions → Apps Script**
2. Hapus kode default, paste kode berikut:

```javascript
const SHEET_NAME = "Sheet1";

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (action === "get") {
    const data = ss.getDataRange().getValues();
    data.shift(); // hapus header
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getRow") {
    const rowIndex = parseInt(e.parameter.rowIndex);
    const row = ss.getRange(rowIndex, 1, 1, 10).getValues()[0];
    return ContentService.createTextOutput(JSON.stringify(row))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action;

  if (action === "add") {
    const lastRow = ss.getLastRow();
    const no = lastRow; // baris 1 = header, jadi no = lastRow
    const timestamp = new Date().toLocaleString("id-ID");
    ss.appendRow([
      no,
      payload.namaCustomer,
      payload.noHp,
      payload.jenisAksesoris,
      payload.namaProduk,
      payload.brand,
      payload.harga,
      payload.tanggalPesan,
      payload.keterangan,
      timestamp
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "edit") {
    const rowIndex = parseInt(payload.rowIndex);
    const timestamp = new Date().toLocaleString("id-ID");
    const no = ss.getRange(rowIndex, 1).getValue(); // pertahankan nomor asli
    ss.getRange(rowIndex, 1, 1, 10).setValues([[
      no,
      payload.namaCustomer,
      payload.noHp,
      payload.jenisAksesoris,
      payload.namaProduk,
      payload.brand,
      payload.harga,
      payload.tanggalPesan,
      payload.keterangan,
      timestamp
    ]]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "delete") {
    const rowIndex = parseInt(payload.rowIndex);
    ss.deleteRow(rowIndex);
    // Renumber semua baris setelah hapus
    const lastRow = ss.getLastRow();
    for (let i = 2; i <= lastRow; i++) {
      ss.getRange(i, 1).setValue(i - 1);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Langkah 3 — Deploy sebagai Web App

1. Klik **Deploy → New deployment**
2. Pilih type: **Web app**
3. Isi:
   - Description: `Aksesoris API`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik **Deploy** → izinkan akses
5. Copy **URL** yang muncul

---

## Langkah 4 — Pasang URL ke Website

Buka file `script.js`, ganti baris ini:

```javascript
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
```

Ganti `YOUR_SCRIPT_ID` dengan URL yang kamu copy tadi.

---

## Catatan Penting

- Setiap kali kamu **edit kode Apps Script**, kamu harus **deploy ulang** (New Deployment) dan update URL di `script.js`
- Jika ada error CORS, pastikan setting "Who has access" = **Anyone**
