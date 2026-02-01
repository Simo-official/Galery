// 1. Inisialisasi Style & Animasi
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .room-bg { background-image: url('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000'); background-size: cover; background-position: center; }
    #zoom-image { transition: transform 0.2s ease-out; cursor: zoom-in; }
`;
document.head.appendChild(style);

// 2. Load Data Produk
const fetchKatalog = async () => {
    const catalogContainer = document.getElementById('catalog');
    if (!catalogContainer) return;
    try {
        const response = await fetch('/content/katalog-semua.json');
        const products = await response.json();
        catalogContainer.innerHTML = '';
        products.forEach(item => renderCard(item));
    } catch (error) {
        console.error("Error:", error);
    }
};

// 3. Render Kartu Produk (Halaman Utama)
const renderCard = (item) => {
    const catalogContainer = document.getElementById('catalog');
    const isSold = item.status === "Terjual";
    const card = document.createElement('div');
    card.className = "group cursor-none flex flex-col mb-10";
    card.innerHTML = `
        <div class="relative aspect-[4/5] bg-stone-100 overflow-hidden flex items-center justify-center">
            <img src="${item.image}" class="w-full h-full object-contain p-4 ${isSold ? 'grayscale' : ''}">
            <div class="custom-cursor fixed pointer-events-none opacity-0 group-hover:opacity-100 z-[60] bg-black text-white text-[10px] px-3 py-1.5 rounded-full tracking-widest uppercase font-bold mix-blend-difference">VIEW</div>
        </div>
        <div class="mt-4">
            <h3 class="text-lg font-serif">${item.title}</h3>
            <p class="text-amber-900 font-bold mt-1">${item.price}</p>
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

// 4. Modal Detail + High-Res Zoom + Room View
const showDetail = (item) => {
    let currentZoom = 1;
    const waLink = `https://wa.me/628123456789?text=Halo, saya tertarik dengan "${item.title}".`;

    const modalHTML = `
        <div id="modal-detail" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
            <div class="bg-stone-50 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
                <button onclick="document.getElementById('modal-detail').remove()" class="absolute top-4 right-4 z-[110] text-stone-800 text-4xl font-light">&times;</button>
                
                <div id="zoom-container" class="md:w-3/5 bg-stone-200 overflow-hidden relative flex items-center justify-center p-6 min-h-[400px]">
                    <img id="zoom-image" src="${item.image}" class="max-w-full max-h-full object-contain shadow-2xl origin-center">
                    
                    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[110]">
                        <button id="btn-zoom-out" class="w-12 h-12 bg-white shadow-xl flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition-all text-2xl">−</button>
                        <button id="btn-zoom-in" class="w-12 h-12 bg-white shadow-xl flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition-all text-2xl">+</button>
                        <button id="btn-fs" class="w-12 h-12 bg-white shadow-xl flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition-all text-sm">⛶</button>
                    </div>
                </div>
                
                <div class="md:w-2/5 p-8 md:p-12 flex flex-col overflow-y-auto">
                    <span class="text-amber-800 tracking-widest text-[10px] uppercase mb-2 font-bold">${item.status}</span>
                    <h2 class="text-4xl font-serif mb-4 text-stone-900">${item.title}</h2>
                    <div class="prose prose-stone text-sm text-stone-600 mb-8 leading-relaxed">
                        ${item.body ? item.body.replace(/\n/g, '<br>') : 'Tidak ada deskripsi.'}
                    </div>
                    
                    <div class="mt-auto space-y-4">
                        <div class="flex justify-between items-end border-t pt-6">
                            <p class="text-2xl font-bold text-amber-900 font-serif">${item.price}</p>
                            <a href="${waLink}" target="_blank" class="bg-stone-900 text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-amber-900 transition-all">Tanya Kurator</a>
                        </div>
                        
                        <button id="btn-room-view" class="w-full border border-stone-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all">
                            Lihat di Ruangan (Room View)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // LOGIKA ZOOM
    const img = document.getElementById('zoom-image');
    const zCont = document.getElementById('zoom-container');
    const updateZoom = (z) => {
        currentZoom = Math.min(Math.max(z, 1), 5);
        img.style.transform = `scale(${currentZoom})`;
        zCont.style.cursor = currentZoom > 1 ? 'move' : 'zoom-in';
    };

    document.getElementById('btn-zoom-in').onclick = () => updateZoom(currentZoom + 0.5);
    document.getElementById('btn-zoom-out').onclick = () => updateZoom(currentZoom - 0.5);
    document.getElementById('btn-fs').onclick = () => zCont.requestFullscreen();

    zCont.onmousemove = (e) => {
        if (currentZoom > 1) {
            const { left, top, width, height } = zCont.getBoundingClientRect();
            img.style.transformOrigin = `${((e.clientX - left) / width) * 100}% ${((e.clientY - top) / height) * 100}%`;
        }
    };

    // LOGIKA ROOM VIEW
    document.getElementById('btn-room-view').onclick = () => {
        const roomHTML = `
            <div id="room-overlay" class="fixed inset-0 z-[150] room-bg flex items-center justify-center animate-fadeIn p-10">
                <button onclick="document.getElementById('room-overlay').remove()" class="absolute top-8 right-8 bg-white/90 px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold shadow-xl">Tutup</button>
                <div class="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-stone-800 transition-all duration-1000" 
                     style="width: 300px; transform: translateY(-40px);">
                    <img src="${item.image}" class="w-full h-auto">
                    <div class="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-none"></div>
                </div>
                <p class="absolute bottom-10 bg-black/60 text-white px-6 py-2 text-[10px] uppercase tracking-[0.3em]">Simulasi Skala Karya 1:1</p>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', roomHTML);
    };
};

document.addEventListener('DOMContentLoaded', fetchKatalog);