"use strict";

/* =============================================================
   FORMULIR PENDAFTARAN MAHASISWA BARU — UNIVERSITAS SANATA DHARMA
   Jalur Reguler · Tugas: Validasi Form
   Mata Kuliah: Pemrograman Berbasis Web (PROG31W)

   Teknik validasi yang dipakai:
   1. Atribut HTML5 (required, minlength, maxlength, pattern, type=email)
      -> ada di index.html
   2. Constraint Validation API (validity, checkValidity, validationMessage)
   3. Pesan error kustom Bahasa Indonesia via setCustomValidity()
   4. Validasi kustom:
        - Pilihan program studi tidak boleh kembar antar-pilihan
        - Pilihan III tidak boleh diisi jika Pilihan II kosong
        - Field mahasiswa transfer hanya wajib jika kotak transfer dicentang
        - Nilai akreditasi wajib jika status "Terakreditasi"
        - Isian yang hanya berisi spasi dianggap kosong
   5. Pesan error ditampilkan di DOM per field (bukan alert)
   6. Styling status valid/invalid lewat class (lihat style.css)
   ============================================================= */


/* =========================================================
   DATA — Program studi (Bagian B formulir)
   ========================================================= */
const DAFTAR_FAKULTAS = [
  { fakultas: "Keguruan dan Ilmu Pendidikan", prodi: [
    ["Pendidikan Guru Sekolah Dasar", "S1"],
    ["Bimbingan dan Konseling", "S1"],
    ["Pendidikan Bahasa Inggris", "S1"],
    ["Pendidikan Bahasa, Sastra Indonesia & Daerah", "S1"],
    ["Pendidikan Sejarah", "S1"],
    ["Pendidikan Ekonomi", "S1"],
    ["Pendidikan Akuntansi", "S1"],
    ["Pendidikan Matematika", "S1"],
    ["Pendidikan Fisika", "S1"],
    ["Pendidikan Biologi", "S1"],
    ["Pendidikan Agama Katolik", "S1"],
  ]},
  { fakultas: "Ekonomi", prodi: [
    ["Akuntansi", "S1"],
    ["Manajemen", "S1"],
  ]},
  { fakultas: "Sastra", prodi: [
    ["Sastra Indonesia", "S1"],
    ["Sastra Inggris", "S1"],
    ["Ilmu Sejarah", "S1"],
  ]},
  { fakultas: "Sains dan Teknologi", prodi: [
    ["Mekatronika", "D3"],
    ["Teknik Elektro", "S1"],
    ["Teknik Mesin", "S1"],
    ["Teknik Informatika", "S1"],
    ["Matematika", "S1"],
    ["Fisika", "S1"],
  ]},
  { fakultas: "Farmasi", prodi: [
    ["Farmasi", "S1"],
  ]},
];

const ROMAWI = { 1: "I", 2: "II", 3: "III" };

/* Nama tampil tiap field — dipakai untuk menyusun pesan error & ringkasan hasil */
const LABEL = {
  nama: "Nama lengkap",
  jenis_kelamin: "Jenis kelamin",
  status: "Status",
  agama: "Agama",
  kewarganegaraan: "Kewarganegaraan",
  alamat_surat: "Alamat surat",
  alamat_asal: "Alamat asal",
  kabupaten: "Kabupaten/Kota",
  propinsi: "Propinsi",
  telp: "No. telepon rumah",
  hp: "No. HP",
  email: "Alamat e-mail",
  ortu: "Nama orang tua/wali",
  pendidikan_ortu: "Tingkat pendidikan orang tua/wali",
  asal_pt: "Asal perguruan tinggi",
  asal_prodi: "Asal program studi",
  status_transfer: "Status akreditasi",
  nilai_akreditasi: "Nilai akreditasi",
  pilihan1: "Program studi Pilihan I",
  pilihan2: "Program studi Pilihan II",
  pilihan3: "Program studi Pilihan III",
};

/* Pesan khusus untuk pattern / typeMismatch (tiap field berbeda) */
const PESAN_FORMAT = {
  nama: "Nama hanya boleh berisi huruf, spasi, titik, koma, apostrof, dan tanda hubung",
  ortu: "Nama hanya boleh berisi huruf, spasi, titik, koma, apostrof, dan tanda hubung",
  kabupaten: "Kabupaten/Kota hanya boleh berisi huruf",
  propinsi: "Propinsi hanya boleh berisi huruf",
  telp: "Nomor telepon tidak valid. Awali dengan 0 atau +62, hanya angka (contoh: 0274513301)",
  hp: "Nomor HP tidak valid. Contoh: 081234567890 atau +6281234567890",
  email: "Format e-mail tidak valid (contoh: nama@contoh.com)",
};


/* =========================================================
   PERSIAPAN ELEMEN
   ========================================================= */
const $ = (selector, root = document) => root.querySelector(selector);

const form = $("#form-pendaftaran");
const ringkasanError = $("#ringkasan-error");
const bagianHasil = $("#hasil");
const daftarHasil = $("#daftar-hasil");
const cekTransfer = $("#transfer");
const bagianTransfer = $("#bagian-transfer");
const selectNilai = $("#nilai-akreditasi");

/* Ambil semua elemen dengan name tertentu (radio = banyak elemen satu name) */
function ambil(name) {
  return [...form.querySelectorAll(`[name="${name}"]`)];
}

/* Daftar name unik yang divalidasi, sesuai urutan di halaman */
function daftarNama() {
  const semua = [...form.elements]
    .filter((el) => el.name && el.name !== "transfer")
    .map((el) => el.name);
  return [...new Set(semua)];
}

function nilaiRadio(name) {
  const terpilih = form.querySelector(`[name="${name}"]:checked`);
  return terpilih ? terpilih.value : "";
}


/* =========================================================
   RENDER TABEL PROGRAM STUDI (DOM)
   ========================================================= */
function renderTabelProdi() {
  const tbody = $("#tabel-prodi tbody");

  DAFTAR_FAKULTAS.forEach((grup) => {
    grup.prodi.forEach(([namaProdi, jenjang], i) => {
      const tr = document.createElement("tr");

      if (i === 0) {
        const tdFak = document.createElement("td");
        tdFak.className = "fak";
        tdFak.rowSpan = grup.prodi.length;
        tdFak.textContent = grup.fakultas;
        tr.appendChild(tdFak);
      }

      const tdProdi = document.createElement("td");
      tdProdi.textContent = namaProdi;
      const tdJenjang = document.createElement("td");
      tdJenjang.className = "tengah";
      tdJenjang.textContent = jenjang;
      tr.appendChild(tdProdi);
      tr.appendChild(tdJenjang);

      [1, 2, 3].forEach((n) => {
        const td = document.createElement("td");
        td.className = "tengah";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `pilihan${n}`;
        radio.value = namaProdi;
        radio.required = n === 1; // hanya Pilihan I yang wajib (HTML5 required)
        radio.setAttribute("aria-label", `Pilihan ${ROMAWI[n]}: ${namaProdi}`);
        td.appendChild(radio);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  });
}

/* Beri warna pada baris yang sudah dipilih di salah satu kolom */
function perbaruiBaris() {
  document.querySelectorAll("#tabel-prodi tbody tr").forEach((tr) => {
    tr.classList.toggle("dipilih", !!tr.querySelector("input:checked"));
  });
}


/* =========================================================
   VALIDASI — Constraint Validation API + setCustomValidity
   ========================================================= */

/* Aturan kustom per field: mengembalikan teks pesan, atau "" jika lolos */
const ATURAN_KUSTOM = {
  pilihan1: () => cekKembar(1),
  pilihan2: () => cekKembar(2),
  pilihan3: () => {
    if (nilaiRadio("pilihan3") && !nilaiRadio("pilihan2")) {
      return "Isi Pilihan II terlebih dahulu sebelum memilih Pilihan III";
    }
    return cekKembar(3);
  },
  nilai_akreditasi: () => "", // wajib/tidaknya diatur lewat atribut required
};

function cekKembar(n) {
  const saya = nilaiRadio(`pilihan${n}`);
  if (!saya) return "";
  for (const m of [1, 2, 3]) {
    if (m !== n && nilaiRadio(`pilihan${m}`) === saya) {
      return `Program studi ini sudah dipilih pada Pilihan ${ROMAWI[m]}`;
    }
  }
  return "";
}

function isTeks(el) {
  return el.tagName === "INPUT" && ["text", "email", "tel"].includes(el.type);
}

/* tooShort bawaan browser hanya aktif setelah user mengetik; cek manual agar konsisten */
function terlaluPendek(el) {
  return isTeks(el) && el.minLength > 0 && el.value.length > 0 && el.value.length < el.minLength;
}

/* Terjemahkan ValidityState menjadi pesan Bahasa Indonesia */
function susunPesan(name, el) {
  const label = LABEL[name] || "Isian ini";
  const kataKerja = isTeks(el) ? "diisi" : "dipilih";
  const v = el.validity;

  if (v.valueMissing) return `${label} wajib ${kataKerja}`;
  if (v.typeMismatch || v.patternMismatch) {
    return PESAN_FORMAT[name] || `Format ${label.toLowerCase()} tidak valid`;
  }
  if (terlaluPendek(el)) return `${label} minimal ${el.minLength} karakter`;
  if (v.tooLong) return `${label} maksimal ${el.maxLength} karakter`;
  return el.validationMessage || `${label} tidak valid`;
}

/* Validasi satu field (atau satu grup radio). Mengembalikan pesan error ("" = valid). */
function validasi(name, tampil = true) {
  const els = ambil(name);
  if (els.length === 0) return "";

  els.forEach((el) => el.setCustomValidity("")); // reset dulu agar validity bersih
  let pesan = "";
  const el0 = els[0];

  if (!el0.disabled) {
    // (a) Isian hanya spasi dianggap kosong
    if (isTeks(el0) && el0.value !== "" && el0.value.trim() === "") {
      pesan = `${LABEL[name]} wajib diisi`;
    }

    // (b) Aturan bawaan HTML5 lewat Constraint Validation API
    if (!pesan) {
      const bermasalah = els.find((el) => !el.validity.valid || terlaluPendek(el));
      if (bermasalah) pesan = susunPesan(name, bermasalah);
    }

    // (c) Aturan kustom
    if (!pesan && ATURAN_KUSTOM[name]) pesan = ATURAN_KUSTOM[name]();

    // Simpan pesan ke elemen -> checkValidity() jadi false & validationMessage terisi
    if (pesan) els.forEach((el) => el.setCustomValidity(pesan));
  }

  if (tampil) tampilkanStatus(name, els, pesan);
  return pesan;
}

/* Tampilkan pesan error di DOM + class valid/invalid */
function tampilkanStatus(name, els, pesan) {
  const elError = $(`#error-${name}`);
  if (elError) elError.textContent = pesan;

  const radio = els[0].type === "radio";
  els.forEach((el) => {
    el.setAttribute("aria-invalid", pesan ? "true" : "false");
    if (elError) el.setAttribute("aria-describedby", elError.id);
    if (!radio) {
      el.classList.toggle("invalid", !!pesan);
      el.classList.toggle("valid", !pesan && el.value.trim() !== "" && !el.disabled);
    }
  });

  if (radio) {
    const grup = els[0].closest(".pilihan");
    if (grup) grup.classList.toggle("invalid", !!pesan);
  }
}

/* Hapus semua jejak validasi pada satu field */
function bersihkan(name) {
  const els = ambil(name);
  els.forEach((el) => {
    el.setCustomValidity("");
    el.classList.remove("valid", "invalid");
    el.removeAttribute("aria-invalid");
  });
  const elError = $(`#error-${name}`);
  if (elError) elError.textContent = "";
  const grup = els[0] && els[0].closest(".pilihan");
  if (grup) grup.classList.remove("invalid");
}


/* =========================================================
   VALIDASI BERSYARAT — Mahasiswa Transfer
   ========================================================= */
function aturTransfer(aktif) {
  bagianTransfer.hidden = !aktif;

  ["asal_pt", "asal_prodi"].forEach((n) => {
    ambil(n).forEach((el) => {
      el.required = aktif;
      if (!aktif) el.value = "";
    });
  });
  ambil("status_transfer").forEach((el) => {
    el.required = aktif;
    if (!aktif) el.checked = false;
  });

  if (!aktif) aturNilaiAkreditasi(false);
  if (!aktif) ["asal_pt", "asal_prodi", "status_transfer", "nilai_akreditasi"].forEach(bersihkan);
}

function aturNilaiAkreditasi(aktif) {
  selectNilai.disabled = !aktif;
  selectNilai.required = aktif;
  if (!aktif) {
    selectNilai.value = "";
    bersihkan("nilai_akreditasi");
  }
}


/* =========================================================
   EVENT — validasi saat user mengisi
   ========================================================= */

/* Teks/email/tel: validasi setiap ketikan */
form.addEventListener("input", (e) => {
  const el = e.target;
  if (el.name && isTeks(el)) validasi(el.name);
});

/* Saat meninggalkan field: rapikan spasi lalu validasi */
form.addEventListener("focusout", (e) => {
  const el = e.target;
  if (el.name && isTeks(el)) {
    el.value = el.value.trim();
    validasi(el.name);
  }
});

/* Radio & select: validasi saat pilihan berubah */
form.addEventListener("change", (e) => {
  const el = e.target;
  if (!el.name) return;

  if (el.name.startsWith("pilihan")) {
    perbaruiBaris();
    [1, 2, 3].forEach((n) => validasi(`pilihan${n}`)); // cek kembar dua arah
    return;
  }

  if (el.name === "status_transfer") {
    aturNilaiAkreditasi(el.value === "Terakreditasi");
    validasi("status_transfer");
    return;
  }

  if (el.type === "radio" || el.tagName === "SELECT") validasi(el.name);
});

cekTransfer.addEventListener("change", () => aturTransfer(cekTransfer.checked));

/* Tombol "Kosongkan Pilihan II / III" (radio tidak bisa di-uncheck sendiri) */
document.querySelectorAll("[data-kosongkan]").forEach((tombol) => {
  tombol.addEventListener("click", () => {
    ambil(tombol.dataset.kosongkan).forEach((el) => (el.checked = false));
    perbaruiBaris();
    [1, 2, 3].forEach((n) => validasi(`pilihan${n}`));
  });
});


/* =========================================================
   SUBMIT — validasi seluruh field, proses hanya jika semua valid
   ========================================================= */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const daftarError = [];
  daftarNama().forEach((name) => {
    const pesan = validasi(name);
    if (pesan) daftarError.push({ name, pesan });
  });

  if (daftarError.length > 0) {
    tampilkanRingkasanError(daftarError);
    ambil(daftarError[0].name)[0].focus(); // fokus ke field error pertama
    return;
  }

  ringkasanError.hidden = true;
  tampilkanHasil();
});

function tampilkanRingkasanError(daftarError) {
  ringkasanError.replaceChildren();

  const judul = document.createElement("strong");
  judul.textContent = `Formulir belum dapat dikirim: ada ${daftarError.length} isian yang perlu diperbaiki.`;
  const ul = document.createElement("ul");

  daftarError.forEach(({ name, pesan }) => {
    const li = document.createElement("li");
    const tautan = document.createElement("a");
    tautan.href = "#";
    tautan.textContent = pesan;
    tautan.addEventListener("click", (ev) => {
      ev.preventDefault();
      ambil(name)[0].focus();
    });
    li.appendChild(tautan);
    ul.appendChild(li);
  });

  ringkasanError.appendChild(judul);
  ringkasanError.appendChild(ul);
  ringkasanError.hidden = false;
  ringkasanError.scrollIntoView({ behavior: "smooth", block: "start" });
}

function tambahBaris(label, isi) {
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = isi;
  daftarHasil.appendChild(dt);
  daftarHasil.appendChild(dd);
}

function tampilkanHasil() {
  daftarHasil.replaceChildren();

  daftarNama().forEach((name) => {
    const el = ambil(name)[0];
    if (el.disabled) return;

    const isi = el.type === "radio" ? nilaiRadio(name) : el.value.trim();
    if (isi === "") return; // field opsional yang dikosongkan tidak ditampilkan

    const label = name.startsWith("pilihan") ? LABEL[name] : LABEL[name] || name;
    tambahBaris(label, isi);
  });

  tambahBaris("Mahasiswa transfer", cekTransfer.checked ? "Ya" : "Tidak");

  form.hidden = true;
  bagianHasil.hidden = false;
  bagianHasil.setAttribute("tabindex", "-1");
  bagianHasil.focus();
  bagianHasil.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Isi formulir baru */
$("#btn-ulang").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  bagianHasil.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* Setelah reset: bersihkan semua status validasi */
form.addEventListener("reset", () => {
  setTimeout(() => {
    daftarNama().forEach(bersihkan);
    aturTransfer(false);
    perbaruiBaris();
    ringkasanError.hidden = true;
  }, 0);
});


/* =========================================================
   INISIALISASI
   ========================================================= */
renderTabelProdi();
aturTransfer(false);
