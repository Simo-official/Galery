const fs = require('fs');
const path = require('path');

const dir = './content/produk';
const files = fs.readdirSync(dir);
const allData = files.map(file => {
    return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
});

// Simpan jadi satu file besar
fs.writeFileSync('./content/katalog-semua.json', JSON.stringify(allData));
console.log('Katalog berhasil digabungkan!');

const fetchKatalog = async () => {
    const catalogContainer = document.getElementById('catalog');
    
    try {
        // Ambil file yang sudah digabung oleh script build tadi
        const response = await fetch('/content/katalog-semua.json');
        const products = await response.json();

        if (products.length === 0) {
            catalogContainer.innerHTML = '<p class="col-span-full text-center">Belum ada koleksi yang ditambahkan.</p>';
            return;
        }

        catalogContainer.innerHTML = '';
        products.forEach(item => {
            // Gunakan fungsi render yang sama seperti sebelumnya
            renderCard(item);
        });
    } catch (error) {
        console.error("Error:", error);
        catalogContainer.innerHTML = '<p class="text-center">Gagal memuat katalog.</p>';
    }
};

const renderCard = (item) => {
    const catalogContainer = document.getElementById('catalog');
    const isSold = item.status === "Terjual";
    const waLink = `https://wa.me/628123456789?text=Halo, saya tertarik dengan "${item.title}".`;

    catalogContainer.innerHTML += `
        <div class="group">
            <div class="relative aspect-[3/4] bg-stone-200 overflow-hidden">
                <img src="${item.image}" alt="${item.title}" class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 ${isSold ? 'grayscale' : ''}">
                ${isSold ? '<span class="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold tracking-widest uppercase">Terjual</span>' : ''}
            </div>
            <div class="mt-4">
                <h3 class="text-lg font-serif">${item.title}</h3>
                <p class="text-stone-500 text-sm mb-2">${item.year || ''}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-amber-900">${item.price}</span>
                    <a href="${waLink}" target="_blank" class="text-xs border-b border-stone-800 pb-1 hover:text-amber-700 hover:border-amber-700 transition-colors uppercase tracking-tighter">
                        Tanya Kurator
                    </a>
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', fetchKatalog);