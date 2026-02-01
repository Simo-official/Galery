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
    const shortDesc = item.body ? item.body.substring(0, 100) + '...' : '';

    const card = document.createElement('div');
    card.className = "group cursor-pointer flex flex-col";
    card.innerHTML = `
        <div class="relative aspect-[4/5] bg-stone-100 overflow-hidden flex items-center justify-center">
            <img src="${item.image}" alt="${item.title}" 
                 class="w-full h-full object-contain p-2 transition-opacity duration-300 group-hover:opacity-80 ${isSold ? 'grayscale' : ''}">
            
            ${isSold ? '<span class="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Terjual</span>' : ''}
        </div>

        <div class="mt-4 flex flex-col flex-grow">
            <h3 class="text-lg font-serif text-stone-900">${item.title}</h3>
            
            <div class="max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-24">
                <p class="text-stone-500 text-sm italic mt-2 leading-relaxed">
                    ${shortDesc}
                </p>
            </div>

            <div class="mt-auto pt-2 flex justify-between items-center">
                <span class="font-bold text-amber-900">${item.price}</span>
                <span class="text-[10px] border-b border-stone-400 pb-1 uppercase tracking-widest text-stone-400 group-hover:text-amber-700 group-hover:border-amber-700 transition-colors">Detail</span>
            </div>
        </div>
    `;

    card.onclick = () => showDetail(item);
    catalogContainer.appendChild(card);
};

// Fungsi Modal Detail Tetap Sama
const showDetail = (item) => {
    const waLink = `https://wa.me/628123456789?text=Halo Kurator, saya tertarik dengan "${item.title}". Apakah masih tersedia?`;
    
    const modalHTML = `
        <div id="modal-detail" class="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div class="bg-stone-50 max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-sm flex flex-col md:flex-row relative shadow-2xl">
                <button onclick="document.getElementById('modal-detail').remove()" class="absolute top-4 right-4 z-10 text-stone-800 hover:text-red-600 text-3xl">&times;</button>
                
                <div class="md:w-3/5 bg-stone-200 flex items-center justify-center p-4">
                    <img src="${item.image}" class="max-w-full max-h-full object-contain shadow-lg">
                </div>
                
                <div class="md:w-2/5 p-8 md:p-10 flex flex-col">
                    <span class="text-amber-800 font-medium tracking-[0.2em] text-[10px] uppercase mb-2">${item.status}</span>
                    <h2 class="text-3xl font-serif mb-2 text-stone-900">${item.title}</h2>
                    <p class="text-stone-400 mb-6 text-sm italic">${item.year || ''}</p>
                    
                    <div class="prose prose-stone text-stone-700 text-sm leading-relaxed mb-8">
                        ${item.body.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="mt-auto pt-6 border-t border-stone-200 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] text-stone-400 uppercase tracking-widest">Harga</p>
                            <p class="text-xl font-bold text-amber-900">${item.price}</p>
                        </div>
                        <a href="${waLink}" target="_blank" class="bg-stone-900 text-white px-6 py-3 hover:bg-amber-900 transition-colors text-xs uppercase tracking-[0.2em]">Tanya Kurator</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};
document.addEventListener('DOMContentLoaded', fetchKatalog);