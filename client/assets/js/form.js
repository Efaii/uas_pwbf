document.addEventListener("DOMContentLoaded", function () {
    const showAddFormBtn = document.getElementById("showAddFormBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelAddFormBtn = document.getElementById("cancelAddFormBtn");
    const addPortfolioForm = document.getElementById("addPortfolioForm");

    function showModal() {
    modalOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
    }

    function hideModal() {
    modalOverlay.classList.remove("show");
    document.body.style.overflow = "auto";
    addPortfolioForm.reset();
    }

    // Event listeners menampilkan/menyembunyikan modal
    if (showAddFormBtn) {
        showAddFormBtn.addEventListener("click", showModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", hideModal);
    }

    if (cancelAddFormBtn) {
        cancelAddFormBtn.addEventListener("click", hideModal);
    }

    // Close modal saat klik di luar form
    if (modalOverlay) {
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }

    // Close modal dengan esc
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
            hideModal();
        }
    });

    // Form submission handling
    if (addPortfolioForm) {
        addPortfolioForm.addEventListener("submit", function (e) {
            e.preventDefault();

        const namaKegiatan = document.getElementById("namaKegiatan").value;
        const waktuKegiatan = document.getElementById("waktuKegiatan").value;

        if (!namaKegiatan.trim() || !waktuKegiatan.trim()) {
            alert("Mohon lengkapi semua field!");
            return;
        }

        hideModal();
        });
    }

    // Function untuk open modal
    window.openPortfolioModal = function () {
        showModal();
    };

    // Function untuk close modal
    window.closePortfolioModal = function () {
        hideModal();
    };

    // Function untuk mengisi data form
    window.populatePortfolioForm = function (data) {
        if (data.nama_kegiatan) {
            document.getElementById("namaKegiatan").value = data.nama_kegiatan;
        }
        if (data.waktu_kegiatan) {
            document.getElementById("waktuKegiatan").value = data.waktu_kegiatan;
        }
    };
});
