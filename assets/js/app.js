// assets/js/app.js
const fetchKatalog = async () => {
    const catalogContainer = document.getElementById('catalog');
    if (!catalogContainer) return;

    try {
        // Panggil file hasil gabungan
        const response = await fetch('/content/katalog-semua.json');
        const products = await response.json();

        if (products.length === 0) {
            catalogContainer.innerHTML = '<p class="col-span-full text-center">Belum ada koleksi.</p>';
            return;
        }

        catalogContainer.innerHTML = '';
        products.forEach(item => renderCard(item));
    } catch (error) {
        console.error("Error:", error);
        catalogContainer.innerHTML = '<p class="text-center">Gagal memuat katalog.</p>';
    }
};

const renderCard = (item) => {
    const catalogContainer = document.getElementById('catalog');
    const isSold = item.status === "Terjual";
    
    // Potong deskripsi untuk tampilan singkat (hover)
    const shortDesc = item.body ? item.body.substring(0, 60) + '...' : '';

    const card = document.createElement('div');
    card.className = "group cursor-pointer";
    card.innerHTML = `
        <div class="relative aspect-[3/4] bg-stone-200 overflow-hidden">
            <img src="${item.image}" alt="${item.title}" class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 ${isSold ? 'grayscale' : ''}">
            
            <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 text-center">
                <p class="text-white text-sm italic">${shortDesc}</p>
            </div>

            ${isSold ? '<span class="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 text-xs font-bold uppercase">Terjual</span>' : ''}
        </div>
        <div class="mt-4">
            <h3 class="text-lg font-serif">${item.title}</h3>
            <div class="flex justify-between items-center mt-2">
                <span class="font-bold text-amber-900">${item.price}</span>
                <span class="text-xs border-b border-stone-400 pb-1 uppercase tracking-widest text-stone-500">Lihat Detail</span>
            </div>
        </div>
    `;

    // Klik untuk buka detail
    card.onclick = () => showDetail(item);
    catalogContainer.appendChild(card);
};

// Fungsi untuk menampilkan Modal Detail
const showDetail = (item) => {
    const waLink = `https://wa.me/628123456789?text=Halo Kurator, saya tertarik dengan "${item.title}". Apakah masih tersedia?`;
    
    const modalHTML = `
        <div id="modal-detail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div class="bg-stone-50 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-sm flex flex-col md:flex-row relative">
                <button onclick="document.getElementById('modal-detail').remove()" class="absolute top-4 right-4 z-10 text-stone-800 hover:text-red-600 text-2xl">&times;</button>
                
                <div class="md:w-1/2 bg-stone-200">
                    <img src="${item.image}" class="w-full h-full object-contain shadow-xl">
                </div>
                
                <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <span class="text-amber-800 font-medium tracking-widest text-xs uppercase mb-2">${item.status}</span>
                    <h2 class="text-3xl font-serif mb-4 text-stone-900">${item.title}</h2>
                    <p class="text-stone-500 mb-6 italic border-l-2 border-stone-300 pl-4">${item.year || 'Tahun tidak diketahui'}</p>
                    
                    <div class="prose prose-stone mb-8 text-stone-700 leading-relaxed">
                        ${item.body.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="mt-auto pt-6 border-t border-stone-200 flex items-center justify-between">
                        <div>
                            <p class="text-xs text-stone-400 uppercase tracking-tighter">Mahar / Harga</p>
                            <p class="text-xl font-bold text-amber-900">${item.price}</p>
                        </div>
                        <a href="${waLink}" target="_blank" class="bg-stone-900 text-white px-6 py-3 rounded-sm hover:bg-amber-900 transition-colors text-sm uppercase tracking-widest">Tanya Kurator</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

document.addEventListener('DOMContentLoaded', fetchKatalog);