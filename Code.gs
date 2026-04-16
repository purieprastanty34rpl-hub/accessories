const SHEET_NAME = 'Sheet1';

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME);
}

// GET - Ambil semua data
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1); // skip header
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST - Tambah atau hapus data
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet();

    if (payload.action === 'add') {
      return addData(sheet, payload);
    } else if (payload.action === 'delete') {
      return deleteData(sheet, payload.no);
    }

    return respond('error', 'Action tidak dikenal');
  } catch (err) {
    return respond('error', err.message);
  }
}

function addData(sheet, payload) {
  const lastRow = sheet.getLastRow();
  const no = lastRow <= 1 ? 1 : sheet.getRange(lastRow, 1).getValue() + 1;
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');

  // Urutan kolom sesuai header spreadsheet:
  // No | Nama Customer | No HP Customer | Jenis Produk | Brand | Bahan | Harga | Tanggal Pemesanan | Keterangan | Timestamp
  sheet.appendRow([
    no,
    payload.namaCustomer,
    payload.noHp,
    payload.jenisProduk,
    payload.brand || '-',
    payload.bahan || '-',
    payload.harga,
    payload.tanggalPemesanan,
    payload.keterangan || '-',
    timestamp
  ]);

  return respond('success', 'Data berhasil ditambahkan');
}

function deleteData(sheet, no) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == no) {
      sheet.deleteRow(i + 1);
      return respond('success', 'Data berhasil dihapus');
    }
  }
  return respond('error', 'Data tidak ditemukan');
}

function respond(status, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ status, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
