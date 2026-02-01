// 1. Inisialisasi Style untuk Animasi & Custom Cursor Dasar
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .custom-cursor { transition: opacity 0.2s ease; }
    #zoom-image { transition: transform 0.2s ease-out, transform-origin 0.1s ease-out; }
`;
document.head.appendChild(style);

// 2. Load Data Produk
const fetchKatalog = async () => {
    const catalogContainer = document.getElementById('catalog');
    if (!catalogContainer) return;

    try {
        const response = await fetch('/content/katalog-semua.json');
        const products = await response.json();

        if (products.length === 0) {
            catalogContainer.innerHTML = '<p class="col-span-full text-center py-20 text-stone-400">Belum ada koleksi yang ditambahkan.</p>';
            return;
        }

        catalogContainer.innerHTML = '';
        products.forEach(item => renderCard(item));
    } catch (error) {
        console.error("Error:", error);
        catalogContainer.innerHTML = '<p class="text-center py-20">Gagal memuat katalog.</p>';
    }
};

// 3. Render Kartu Produk
const renderCard = (item) => {
    const catalogContainer = document.getElementById('catalog');
    const isSold = item.status === "Terjual";
    const shortDesc = item.body ? item.body.substring(0, 100) + '...' : '';

    const card = document.createElement('div');
    card.className = "group cursor-none flex flex-col relative";
    card.innerHTML = `
        <div class="relative aspect-[4/5] bg-stone-100 overflow-hidden flex items-center justify-center pointer-events-auto shadow-sm group-hover:shadow-md transition-shadow">
            <img src="${item.image}" alt="${item.title}" 
                 class="w-full h-full object-contain p-4 transition-opacity duration-300 group-hover:opacity-90 ${isSold ? 'grayscale' : ''}">
            
            <div class="custom-cursor fixed pointer-events-none opacity-0 group-hover:opacity-100 z-[60] bg-black text-white text-[10px] px-3 py-1.5 rounded-full tracking-[0.2em] uppercase font-bold mix-blend-difference">
                View
            </div>

            ${isSold ? '<span class="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Terjual</span>' : ''}
        </div>

        <div class="mt-4 flex flex-col flex-grow">
            <h3 class="text-lg font-serif text-stone-900 leading-tight">${item.title}</h3>
            <div class="max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-24">
                <p class="text-stone-500 text-sm italic mt-2 leading-relaxed">${shortDesc}</p>
            </div>
            <div class="mt-auto pt-3 flex justify-between items-center">
                <span class="font-bold text-amber-900">${item.price}</span>
                <span class="text-[10px] border-b border-stone-300 pb-1 uppercase tracking-widest text-stone-400 group-hover:text-amber-800 group-hover:border-amber-800 transition-colors">Lihat Detail</span>
            </div>
        </div>
    `;

    const cursor = card.querySelector('.custom-cursor');
    card.onmousemove = (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.transform = 'translate(-50%, -50%)';
    };

    card.onclick = () => showDetail(item);
    catalogContainer.appendChild(card);
};

// 4. Modal Detail & Zoom
const showDetail = (item) => {
    const waLink = `https://wa.me/628123456789?text=Halo Kurator, saya tertarik dengan "${item.title}".`;
    let currentZoom = 1;

    const modalHTML = `
        <div id="modal-detail" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
            <div class="bg-stone-50 max-w-6xl w-full max-h-[95vh] overflow-y-auto rounded-sm flex flex-col md:flex-row relative shadow-2xl">
                <button onclick="document.getElementById('modal-detail').remove()" class="absolute top-4 right-4 z-[110] text-stone-800 hover:text-red-600 text-4xl font-light">&times;</button>
                
                <div class="md:w-3/5 bg-stone-200 overflow-hidden relative group/zoom flex items-center justify-center p-6 min-h-[450px]">
                    <img id="zoom-image" src="${item.image}" 
                         class="max-w-full max-h-full object-contain shadow-2xl origin-center">
                    
                    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[110]">
                        <button id="btn-zoom-out" class="w-12 h-12 bg-white/90 shadow-xl flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-full border border-stone-200">
                            <span class="text-2xl">−</span>
                        </button>
                        <button id="btn-zoom-in" class="w-12 h-12 bg-white/90 shadow-xl flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-full border border-stone-200">
                            <span class="text-2xl">+</span>
                        </button>
                    </div>
                </div>
                
                <div class="md:w-2/5 p-8 md:p-12 flex flex-col">
                    <span class="text-amber-800 font-medium tracking-[0.3em] text-[10px] uppercase mb-3">${item.status}</span>
                    <h2 class="text-4xl font-serif mb-3 text-stone-900 leading-tight">${item.title}</h2>
                    <p class="text-stone-400 mb-8 text-sm italic border-l-2 border-amber-800/30 pl-4">${item.year || 'Karya Tanpa Tahun'}</p>
                    
                    <div class="prose prose-stone text-stone-700 text-sm leading-relaxed mb-10">
                        ${item.body ? item.body.replace(/\n/g, '<br>') : 'Tidak ada deskripsi.'}
                    </div>
                    
                    <div class="mt-auto pt-8 border-t border-stone-200 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Mahar</p>
                            <p class="text-2xl font-bold text-amber-900 font-serif">${item.price}</p>
                        </div>
                        <a href="${waLink}" target="_blank" class="bg-stone-900 text-white px-8 py-4 hover:bg-amber-900 transition-all text-xs uppercase tracking-[0.2em] shadow-lg">Tanya Kurator</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const img = document.getElementById('zoom-image');
    const zoomContainer = img.parentElement;
    const btnIn = document.getElementById('btn-zoom-in');
    const btnOut = document.getElementById('btn-zoom-out');

    const updateZoom = (newZoom) => {
        currentZoom = Math.min(Math.max(newZoom, 1), 4); // Maksimal zoom 4x
        img.style.transform = `scale(${currentZoom})`;
        zoomContainer.style.cursor = currentZoom > 1 ? 'move' : 'default';
    };

    btnIn.onclick = (e) => { e.stopPropagation(); updateZoom(currentZoom + 0.5); };
    btnOut.onclick = (e) => { e.stopPropagation(); updateZoom(currentZoom - 0.5); };

    zoomContainer.onmousemove = (e) => {
        if (currentZoom > 1) {
            const { left, top, width, height } = zoomContainer.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        }
    };

    zoomContainer.ondblclick = () => updateZoom(1);
};

// 5. Jalankan Saat Halaman Siap
document.addEventListener('DOMContentLoaded', fetchKatalog);