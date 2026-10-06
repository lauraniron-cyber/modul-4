const tema = document.querySelector("#btn-tema");
const info = document.querySelector("#btn-info");
const aside = document.querySelector("aside");
const artikel = document.querySelector(".daftar-artikel");

tema.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

info.addEventListener("click", () => {
    aside.classList.toggle("tersembunyi");
});


const data = [
    ["Website Profil", "Membuat website menggunakan HTML dan CSS."],
    ["Program Python", "Membuat program sederhana menggunakan Python."],
    ["Fuzzy Logic", "Membuat program menggunakan fuzzy logic."]
];


function tampilkan() {
    artikel.innerHTML = "";

    data.forEach((item) => {
        const a = document.createElement("article");

        a.innerHTML = `
            <h3>${item[0]}</h3>
            <p>${item[1]}</p>
            <button class="like">Like (0)</button>
            <button class="hapus">Hapus</button>
        `;

        artikel.appendChild(a);
    });
}

tampilkan();


document.querySelector("#btn-tambah").addEventListener("click", () => {

    const nama = prompt("Nama portofolio:");

    if (nama) {
        data.push([
            nama,
            "Portofolio yang ditambahkan melalui JavaScript."
        ]);

        tampilkan();
    }
});


artikel.addEventListener("mouseover", (e) => {
    const a = e.target.closest("article");
    if (a) a.classList.add("artikel-hover");
});

artikel.addEventListener("mouseout", (e) => {
    const a = e.target.closest("article");
    if (a) a.classList.remove("artikel-hover");
});


artikel.addEventListener("click", (e) => {

    if (e.target.classList.contains("hapus")) {
        e.target.closest("article").remove();
    }

    if (e.target.classList.contains("like")) {
        let n = Number(e.target.dataset.like || 0);
        n++;
        e.target.dataset.like = n;
        e.target.textContent = `Like (${n})`;
    }
});


const form = document.querySelector("#form-komentar");
const daftar = document.querySelector("#daftar-komentar");
const error = document.querySelector("#pesan-error");

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const nama = document.querySelector("#input-nama").value.trim();
    const pesan = document.querySelector("#input-pesan").value.trim();

    if (nama === "" || pesan.length < 5) {
        error.textContent = "Nama wajib diisi dan komentar minimal 5 karakter.";
        return;
    }

    error.textContent = "";

    const li = document.createElement("li");
    li.className = "komentar-item";

    li.innerHTML = `
        ${nama}: ${pesan}
        <button class="hapus-komentar">Hapus</button>
    `;

    daftar.appendChild(li);
    form.reset();
});


daftar.addEventListener("click", (e) => {

    if (e.target.classList.contains("hapus-komentar")) {
        e.target.parentElement.remove();
    }

});


document.querySelector("#btn-hapus-komentar").addEventListener("click", () => {
    daftar.innerHTML = "";
});


document.addEventListener("keydown", (e) => {

    if (e.key.toLowerCase() === "d") {
        document.body.classList.toggle("dark-mode");
    }

});