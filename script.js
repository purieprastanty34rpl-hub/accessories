// =============================================
// GANTI URL INI dengan URL deployment Apps Script kamu
// =============================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzTDKY9bHJV9aeeJ-AkLgKjL5TFwjsSocwQladhpkEyCsntknLreRi2Vq5cDuFA9yc0_Q/exec';

let allData = [];

// =============================================
// LOAD DATA
// =============================================
async function loadData() {
  try {
    showToast('Memuat data...', 'info');
    const res = await fetch(API_URL);
    const json = await res.json();
    if (json.status === 'success') {
      allData = json.data;
      renderTable(allData);
    } else {
      showToast('Gagal memuat data: ' + json.message, 'error');
    }
  } catch (err) {
    showToast('Koneksi gagal. Cek URL API.', 'error');
  }
}

// =============================================
// RENDER TABLE
// =============================================
function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  document.getElementById('totalBadge').textContent = data.length;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="text-center py-10 text-sky-400">
          <div class="flex flex-col items-center gap-2">
            <span class="text-3xl">📦</span>
            <span>Belum ada data. Tambah pesanan baru.</span>
          </div>
        </td>
      </tr>`;
    return;
  }

  // Kolom: No | Nama Customer | No HP Customer | Jenis Produk | Brand | Bahan | Harga | Tanggal Pemesanan | Keterangan | Timestamp
  tbody.innerHTML = data.map(row => `
    <tr class="border-b border-sky-50">
      <td class="px-3 py-2">${row[0]}</td>
      <td class="px-3 py-2">${row[1]}</td>
      <td class="px-3 py-2">${row[2]}</td>
      <td class="px-3 py-2">${row[3]}</td>
      <td class="px-3 py-2">${row[4]}</td>
      <td class="px-3 py-2">${row[5]}</td>
      <td class="px-3 py-2">${formatRupiah(row[6])}</td>
      <td class="px-3 py-2">${row[7]}</td>
      <td class="px-3 py-2">${row[8]}</td>
      <td class="px-3 py-2 text-xs text-gray-400">${row[9]}</td>
      <td class="px-3 py-2 text-center">
        <button onclick="deleteOrder(${row[0]})"
          class="btn-danger text-white px-3 py-1 rounded-lg text-xs font-medium">
          🗑 Hapus
        </button>
      </td>
    </tr>
  `).join('');
}

// =============================================
// SUBMIT FORM
// =============================================
document.getElementById('orderForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const payload = {
    action: 'add',
    namaCustomer: document.getElementById('namaCustomer').value.trim(),
    noHp: document.getElementById('noHp').value.trim(),
    jenisProduk: document.getElementById('jenisProduk').value,
    brand: document.getElementById('brand').value.trim(),
    bahan: document.getElementById('bahan').value.trim(),
    harga: document.getElementById('harga').value.trim(),
    tanggalPemesanan: document.getElementById('tanggalPemesanan').value,
    keterangan: document.getElementById('keterangan').value.trim(),
  };

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.status === 'success') {
      showToast('Pesanan berhasil disimpan!', 'success');
      resetForm();
      loadData();
    } else {
      showToast('Gagal: ' + json.message, 'error');
    }
  } catch (err) {
    showToast('Koneksi gagal.', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '➕ Simpan Pesanan';
});

// =============================================
// DELETE
// =============================================
async function deleteOrder(no) {
  if (!confirm('Yakin ingin menghapus pesanan ini?')) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', no }),
    });
    const json = await res.json();
    if (json.status === 'success') {
      showToast('Data berhasil dihapus.', 'success');
      loadData();
    } else {
      showToast('Gagal hapus: ' + json.message, 'error');
    }
  } catch (err) {
    showToast('Koneksi gagal.', 'error');
  }
}

// =============================================
// FILTER / SEARCH
// =============================================
function filterTable() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allData.filter(row =>
    row[1]?.toString().toLowerCase().includes(keyword) ||
    row[3]?.toString().toLowerCase().includes(keyword)
  );
  renderTable(filtered);
}

// =============================================
// RESET FORM
// =============================================
function resetForm() {
  document.getElementById('orderForm').reset();
  document.getElementById('hargaPreview').textContent = '';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tanggalPemesanan').value = today;
}

// =============================================
// FORMAT RUPIAH
// =============================================
function formatRupiah(value) {
  const num = parseInt(value);
  if (isNaN(num)) return value;
  return 'Rp ' + num.toLocaleString('id-ID');
}

// Preview harga saat diketik
document.getElementById('harga').addEventListener('input', function () {
  document.getElementById('hargaPreview').textContent = formatRupiah(this.value);
});

// =============================================
// TOAST NOTIFICATION
// =============================================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const colors = { success: '#22c55e', error: '#ef4444', info: '#38bdf8' };
  toastMsg.style.background = colors[type] || colors.info;
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tanggalPemesanan').value = today;
  loadData();
});
