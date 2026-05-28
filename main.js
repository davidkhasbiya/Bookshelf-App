const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';

let books = [];// tempat menampung objek buku

//kriteria 1 (membuat web storage)
function generateObjectBook(id, title, author, year, isComplete) {
    return { id, title, author, year, isComplete };
}

function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        // Balut array 'books' menjadi teks string dengan JSON.stringify
        const parsed = JSON.stringify(books);
        // Masukkan ke dalam localStorage dengan kunci yang sudah kita buat
        localStorage.setItem(STORAGE_KEY, parsed);
        // Opsional: pemicu event bahwa data berhasil disimpan
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    // Ambil teks mentah dari localStorage berdasarkan kuncinya
    const serializedData = localStorage.getItem(STORAGE_KEY);
    // Ubah teks mentah tadi menjadi Array/Object asli menggunakan JSON.parse
    let data = JSON.parse(serializedData);
    // Jika lacinya tidak kosong, masukkan semua datanya ke dalam array utama kita
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    // Perintahkan aplikasi untuk menggambar (render) data buku tersebut ke HTML
    document.dispatchEvent(new Event(RENDER_EVENT));
}

//kriteria 2 (menambahkan buku baru)
function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = Number(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const generatedID = new Date().getTime(); // Membuat ID unik dari timestamp

    // Buat objek bukunya
    const bookObject = generateObjectBook(generatedID, title, author, year, isComplete);

    // Masukkan ke array utama
    books.push(bookObject);
    console.log('Isi Array Books Saat Ini:', books);

    // Simpan ke localStorage dan gambar ulang layar
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

//kriteria 3 (membuat dua rak buku & menampilkannya)
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    // Kosongkan rak sebelum digambar ulang agar tidak duplikat
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBookElement(bookItem);

        // Kriteria 3: Pisahkan berdasarkan status isComplete
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }

    // fungsi untuk membuat susunan HTML tiap buku
    function makeBookElement(bookObject) {
        const bookContainer = document.createElement('div');
        bookContainer.setAttribute('data-bookid', bookObject.id);
        bookContainer.setAttribute('data-testid', 'bookItem');

        const titleElement = document.createElement('h3');
        titleElement.setAttribute('data-testid', 'bookItemTitle');
        titleElement.innerText = bookObject.title;

        const authorElement = document.createElement('p');
        authorElement.setAttribute('data-testid', 'bookItemAuthor');
        authorElement.innerText = `Penulis: ${bookObject.author}`;

        const yearElement = document.createElement('p');
        yearElement.setAttribute('data-testid', 'bookItemYear');
        yearElement.innerText = `Tahun: ${bookObject.year}`;

        // Wadah tombol-tombol action
        const buttonContainer = document.createElement('div');

        // 1. Tombol Selesai / Belum Selesai Dibaca
        const isCompleteButton = document.createElement('button');
        isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        isCompleteButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
        isCompleteButton.classList.add('btn-success');
        isCompleteButton.addEventListener('click', function () {
            toggleBookStatus(bookObject.id);
        });

        // 2. Tombol Hapus Buku
        const deleteButton = document.createElement('button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.innerText = 'Hapus Buku';
        deleteButton.classList.add('btn-danger');
        deleteButton.addEventListener('click', function () {
            deleteBook(bookObject.id);
        });

        // 3. Tombol Edit Buku 
        const editButton = document.createElement('button');
        editButton.setAttribute('data-testid', 'bookItemEditButton');
        editButton.innerText = 'Edit Buku';
        editButton.style.backgroundColor = '#f39c12'; // Memberi warna orange sebagai pembeda

        // Gabungkan komponen tombol ke dalam wadah (Jangan lupa masukkan editButton ke sini)
        buttonContainer.append(isCompleteButton, deleteButton, editButton);
        bookContainer.append(titleElement, authorElement, yearElement, buttonContainer);

        return bookContainer;
    }
})

// kriteria 4 (memindahkan buku antar rak)
function toggleBookStatus(bookId) {
    // Cari buku yang ID-nya cocok
    const bookTarget = books.find(book => book.id === bookId);

    if (bookTarget == null) return;

    // Balikkan nilai boolean isComplete
    bookTarget.isComplete = !bookTarget.isComplete;

    // Simpan ke local storage dan gambar ulang layar
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

// kriteria 5 (menghapus data buku)
function deleteBook(bookId) {
    // Cari posisi index buku di dalam array
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex === -1) return;

    // Hapus 1 baris data pada index tersebut
    books.splice(bookIndex, 1);

    // Simpan perubahan dan render ulang halaman
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('bookForm');

    bookForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Mencegah halaman reload saat submit
        addBook();
        bookForm.reset(); // Kosongkan kembali form input setelah tambah buku
    });

    // Ambil data lama dari localStorage saat web baru dibuka
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});