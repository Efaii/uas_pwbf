const menuToggle = document.querySelector('.menu-toggle');
const navUl = document.querySelector('nav ul');

const BASE_API_URL = 'https://uaspwbfbe-production.up.railway.app';

menuToggle.addEventListener('click', () => {
    navUl.classList.toggle('active');
});

async function loadPortofolio() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/portofolio`);
        const data = await response.json();

        const tableBody = document.querySelector('#portofolioTable tbody');
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Tidak ada data portofolio.</td></tr>';
            return;
        }

        data.forEach((item, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${index + 1}.</td>
                <td>${item.nama_kegiatan}</td>
                <td>${item.waktu_kegiatan}</td>
                <td>
                    <button class="edit-btn" data-id="${item.id}" data-nama="${item.nama_kegiatan}" data-waktu="${item.waktu_kegiatan}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}" data-name="${item.nama_kegiatan || 'Tidak Diketahui'}">Hapus</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        addEditButtonListener();
        addDeleteButtonListener();

    } catch (error) {
        console.error('Gagal memuat portofolio:', error);
        document.getElementById('portofolioTable').innerHTML = '<tr><td colspan="5">Gagal memuat data portofolio.</td></tr>'
    }
}

// edit data
function addEditButtonListener() {
    const editButtons = document.querySelectorAll('.edit-btn'); // Dapatkan semua tombol edit
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            const nama = event.target.dataset.nama;
            const waktu = event.target.dataset.waktu;
            showEditModal(id, nama, waktu);
        });
    });
}

const editPortfolioModal = document.getElementById('editPortfolioModal');
const editPortfolioForm = document.getElementById('editPortfolioForm');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

function showEditModal(namaKegiatan, waktuKegiatan) {
    document.getElementById('editNamaKegiatan').value = namaKegiatan;
    document.getElementById('editWaktuKegiatan').value = waktuKegiatan;
    editPortfolioModal.classList.add('show');
}

function hideEditModal() {
    editPortfolioModal.classList.remove('show');
}

closeEditModalBtn.addEventListener('click', hideEditModal);
cancelEditBtn.addEventListener('click', hideEditModal);

editPortfolioModal.addEventListener('click', (event) => {
    if (event.target === editPortfolioModal) {
        hideEditModal();
    }
});

editPortfolioForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('editId').value;
    const namaKegiatan = document.getElementById('editNamaKegiatan').value;
    const waktuKegiatan = document.getElementById('editWaktuKegiatan').value;

    const updatedData = {
        nama_kegiatan: namaKegiatan,
        waktu_kegiatan: waktuKegiatan
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/portofolio/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Data berhasil diupdate:', result);
        hideEditModal();
        alert('Data berhasil diupdate!');
        location.reload();
    } catch (error) {
        console.error('Gagal mengupdate portofolio:', error);
        alert('Gagal mengupdate portofolio: ' + error.message);
    }
});

// function delete
async function addDeleteButtonListener() {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const idToDelete = event.target.dataset.id;
            const nameToDelete = event.target.dataset.name;

            if (confirm(`Anda yakin ingin menghapus "${nameToDelete}" (ID: ${idToDelete})?`)) {
                try {
                    const response = await fetch(`${BASE_API_URL}/api/portofolio/${idToDelete}`, {
                        method: 'DELETE'
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alert(result.message);
                        loadPortofolio();
                    } else {
                        alert(`Gagal menghapus: ${result.error || result.message}`);
                    }
                } catch (error) {
                    console.error('Terjadi kesalahan saat menghapus:', error);
                    alert('Terjadi kesalahan saat menghapus data.');
                }
            }
        });
    });
}

const showAddFormBtn = document.getElementById('showAddFormBtn');
const addPortfolioFormContainer = document.getElementById('addPortfolioFormContainer');
const addPortofolioForm = document.getElementById('addPortofolioForm');
const cancelAddFormBtn = document.getElementById('cancelAddFormBtn');

showAddFormBtn.addEventListener('click', () => {
    addPortfolioFormContainer.classList.add('show');
    addPortfolioFormContainer.scrollIntoView({ behavior: 'smooth' });
});

cancelAddFormBtn.addEventListener('click', () => {
    addPortfolioFormContainer.classList.remove('show');
});

addPortfolioForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const namaKegiatan = document.getElementById('namaKegiatan').value;
    const waktuKegiatan = document.getElementById('waktuKegiatan').value;

    const newData = {
        nama_kegiatan: namaKegiatan,
        waktu_kegiatan: waktuKegiatan,
    };

    try {
        const response = await fetch(`${BASE_API_URL}/api/portofolio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            addPortfolioForm.reset();
            addPortfolioFormContainer.classList.remove('show');
            loadPortofolio();
        } else {
            alert(`Gagal menambahkan data: ${result.error || result.message}`);
        }
    } catch (error) {
        console.error('Terjadi kesalahan saat menambah data:', error);
        alert('Terjadi kesalahan koneksi saat menambah data.');
    }
});

loadPortofolio();