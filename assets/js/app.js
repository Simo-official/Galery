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

// 1. Fungsi Render Kartu di Halaman Utama
const renderCard = (item) => {
    const catalogContainer = document.getElementById('catalog');
    const isSold = item.status === "Terjual";
    const shortDesc = item.body ? item.body.substring(0, 100) + '...' : '';

    const card = document.createElement('div');
    // Tambahkan class 'cursor-none' agar cursor asli hilang & pakai custom cursor
    card.className = "group cursor-none flex flex-col relative";
    card.innerHTML = `
        <div class="relative aspect-[4/5] bg-stone-100 overflow-hidden flex items-center justify-center pointer-events-auto">
            <img src="${item.image}" alt="${item.title}" 
                 class="w-full h-full object-contain p-2 transition-opacity duration-300 group-hover:opacity-80 ${isSold ? 'grayscale' : ''}">
            
            <div class="custom-cursor fixed pointer-events-none opacity-0 group-hover:opacity-100 z-50 bg-white/90 text-black text-[10px] px-3 py-1 rounded-full tracking-widest uppercase font-bold mix-blend-difference transition-opacity duration-300">
                View
            </div>

            ${isSold ? '<span class="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Terjual</span>' : ''}
        </div>

        <div class="mt-4 flex flex-col flex-grow">
            <h3 class="text-lg font-serif text-stone-900">${item.title}</h3>
            <div class="max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-24">
                <p class="text-stone-500 text-sm italic mt-2 leading-relaxed">${shortDesc}</p>
            </div>
            <div class="mt-auto pt-2 flex justify-between items-center">
                <span class="font-bold text-amber-900">${item.price}</span>
                <span class="text-[10px] border-b border-stone-400 pb-1 uppercase tracking-widest text-stone-400 group-hover:text-amber-700 group-hover:border-amber-700 transition-colors">Detail</span>
            </div>
        </div>
    `;

    // Logika Pergerakan Custom Cursor
    const cursor = card.querySelector('.custom-cursor');
    card.onmousemove = (e) => {
        cursor.style.left = e.clientX + 10 + 'px';
        cursor.style.top = e.clientY + 10 + 'px';
    };

    card.onclick = () => showDetail(item);
    catalogContainer.appendChild(card);
};

// 2. Fungsi Modal Detail dengan Fitur Zoom
const showDetail = (item) => {
    const waLink = `https://wa.me/628123456789?text=Halo Kurator, saya tertarik dengan "${item.title}".`;
    
    // Variabel untuk menyimpan level zoom
    let currentZoom = 1;

    const modalHTML = `
        <div id="modal-detail" class="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
            <div class="bg-stone-50 max-w-6xl w-full max-h-[95vh] overflow-y-auto rounded-sm flex flex-col md:flex-row relative shadow-2xl">
                <button onclick="document.getElementById('modal-detail').remove()" class="absolute top-4 right-4 z-[100] text-stone-800 hover:text-red-600 text-3xl font-light">&times;</button>
                
                <div class="md:w-3/5 bg-stone-100 overflow-hidden relative group/zoom flex items-center justify-center p-4 min-h-[400px]">
                    <img id="zoom-image" src="${item.image}" 
                         class="max-w-full max-h-full object-contain shadow-lg transition-transform duration-300 ease-out origin-center">
                    
                    <div class="absolute bottom-6 right-6 flex gap-2 z-[110]">
                        <button id="btn-zoom-out" class="w-10 h-10 bg-white/90 shadow-md flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all rounded-full border border-stone-200">
                            <span class="text-xl">−</span>
                        </button>
                        <button id="btn-zoom-in" class="w-10 h-10 bg-white/90 shadow-md flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all rounded-full border border-stone-200">
                            <span class="text-xl">+</span>
                        </button>
                    </div>
                </div>
                
                <div class="md:w-2/5 p-8 md:p-12 flex flex-col">
                    <span class="text-amber-800 font-medium tracking-[0.2em] text-[10px] uppercase mb-2">${item.status}</span>
                    <h2 class="text-4xl font-serif mb-2 text-stone-900 leading-tight">${item.title}</h2>
                    <p class="text-stone-400 mb-8 text-sm italic border-l border-stone-300 pl-4">${item.year || ''}</p>
                    
                    <div class="prose prose-stone text-stone-700 text-sm leading-relaxed mb-10">
                        ${item.body.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="mt-auto pt-6 border-t border-stone-200 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] text-stone-400 uppercase tracking-widest">Mahar</p>
                            <p class="text-2xl font-bold text-amber-900">${item.price}</p>
                        </div>
                        <a href="${waLink}" target="_blank" class="bg-stone-900 text-white px-8 py-4 hover:bg-amber-900 transition-all text-xs uppercase tracking-widest">Tanya Kurator</a>
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

    // 1. Logika Tombol Zoom (+) dan (-)
    const updateZoom = (newZoom) => {
        currentZoom = Math.min(Math.max(newZoom, 1), 5); // Limit zoom: Min 1x, Max 5x
        img.style.transform = `scale(${currentZoom})`;
        
        // Ganti kursor jika sedang zoom
        zoomContainer.style.cursor = currentZoom > 1 ? 'move' : 'zoom-in';
    };

    btnIn.onclick = (e) => { e.stopPropagation(); updateZoom(currentZoom + 0.5); };
    btnOut.onclick = (e) => { e.stopPropagation(); updateZoom(currentZoom - 0.5); };

    // 2. Logika Zoom Mengikuti Kursor (Hanya jika kursor bergerak di area gambar)
    zoomContainer.onmousemove = (e) => {
        if (currentZoom > 1) {
            const { left, top, width, height } = zoomContainer.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        }
    };

    // 3. Tambahan: Double Click untuk Reset Zoom
    zoomContainer.ondblclick = () => updateZoom(1);
};
document.head.appendChild(style);
document.addEventListener('DOMContentLoaded', fetchKatalog);