// 1. Setup Styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .room-bg { background-image: url('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000'); background-size: cover; background-position: center; }
    #zoom-image { transition: transform 0.3s ease-out; }
    .modal-open { overflow: hidden; }
`;
document.head.appendChild(style);

const fetchKatalog = async () => {
    const catalogContainer = document.getElementById('catalog');
    if (!catalogContainer) return;

    // 1. Tampilkan Loading Spinner (Animasi Putar)
    catalogContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-32 animate-fadeIn">
            <div class="w-8 h-8 border-2 border-stone-200 border-t-amber-900 rounded-full animate-spin"></div>
            <p class="mt-6 text-[10px] text-stone-400 uppercase tracking-[0.3em] font-medium">Menata Galeri...</p>
        </div>
    `;

    try {
        // 2. Fetch data dengan Cache Buster (?t=...) agar selalu fresh
        const response = await fetch('/content/katalog-semua.json?t=' + Date.now());
        
        if (!response.ok) throw new Error("Gagal mengambil data");
        
        const products = await response.json();

        // Jeda sedikit agar transisi loading ke konten tidak terlalu "kaget"
        setTimeout(() => {
            if (products.length === 0) {
                catalogContainer.innerHTML = `
                    <p class="col-span-full text-center py-20 text-stone-400 italic font-serif">
                        Belum ada koleksi yang dipajang.
                    </p>`;
                return;
            }

            catalogContainer.innerHTML = '';
            products.forEach(item => renderCard(item));
        }, 500); // Delay 500ms agar animasi spinner terlihat halus

    } catch (error) {
        console.error("Error:", error);
        catalogContainer.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-stone-500 font-serif">Koneksi ke galeri terputus.</p>
                <button onclick="fetchKatalog()" class="mt-4 text-[10px] uppercase tracking-widest border-b border-stone-400 pb-1 hover:text-amber-900 hover:border-amber-900">Coba Lagi</button>
            </div>
        `;
    }
};

const renderCard = (item) => {
    const catalogContainer = document.getElementById('catalog');
    const isSold = item.status === "Terjual";
    
    // Potong deskripsi untuk tampilan singkat (hover)
    const shortDesc = item.body ? item.body.substring(0, 100) + '...' : '';

    const card = document.createElement('div');
    // Kursor kembali jadi default (pointer)
    card.className = "group cursor-pointer flex flex-col mb-10 relative";
    card.innerHTML = `
        <div class="relative aspect-[4/5] bg-stone-100 overflow-hidden flex items-center justify-center">
            <img src="${item.image}" alt="${item.title}" 
                 class="w-full h-full object-contain p-4 transition-opacity duration-300 group-hover:opacity-90 ${isSold ? 'grayscale' : ''}">
            
            <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                <span class="bg-black/80 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-sm tracking-widest uppercase font-bold shadow-lg">
                    View
                </span>
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

    card.onclick = () => showDetail(item);
    catalogContainer.appendChild(card);
};

// 4. Modal Detail (Zoom & Room View Fixed)
const showDetail = (item) => {
    let currentZoom = 1;
    const waLink = `https://wa.me/628520719373?text=Halo, saya tertarik dengan "${item.title}".`;

    const modalHTML = `
        <div id="modal-detail" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
            <div class="bg-stone-50 w-full h-full md:max-w-7xl md:h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
                
                <button id="btn-close-modal" class="absolute top-4 right-4 z-[120] bg-black/20 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl">&times;</button>
                
                <div id="zoom-container" class="w-full h-1/2 md:h-full md:w-2/3 bg-stone-200 overflow-hidden relative flex items-center justify-center cursor-zoom-in">
                    <img id="zoom-image" src="${item.image}" class="w-full h-full object-contain transition-transform duration-300 ease-out origin-center">
                    
                    <div class="absolute bottom-6 right-6 flex flex-col gap-2 z-[110]">
                        <button id="btn-fs" class="w-12 h-12 bg-white/90 shadow-xl flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition-all text-sm">⛶</button>
                        <button id="btn-zoom-in" class="w-12 h-12 bg-white/90 shadow-xl flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition-all text-2xl">+</button>
                        <button id="btn-zoom-out" class="w-12 h-12 bg-white/90 shadow-xl flex items-center justify-center rounded-full border hover:bg-black hover:text-white transition-all text-2xl">−</button>
                    </div>
                </div>
                
                <div class="w-full h-1/2 md:h-full md:w-1/3 p-8 md:p-12 flex flex-col bg-white overflow-y-auto">
                    <span class="text-amber-800 tracking-widest text-[10px] uppercase mb-2 font-bold">${item.status}</span>
                    <h2 class="text-3xl font-serif mb-4 text-stone-900 leading-tight">${item.title}</h2>
                    <div class="prose prose-stone text-sm text-stone-600 mb-8 leading-relaxed flex-grow">
                        ${item.body ? item.body.replace(/\n/g, '<br>') : 'Tidak ada deskripsi.'}
                    </div>
                    <div class="border-t pt-6 space-y-4">
                        <div class="flex justify-between items-center">
                            <p class="text-2xl font-bold text-amber-900 font-serif">${item.price}</p>
                            <a href="${waLink}" target="_blank" class="bg-stone-900 text-white px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-amber-900 transition-all">Tanya Kurator</a>
                        </div>
                        <button id="btn-room-view" class="w-full border border-stone-900 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all">Lihat di Ruangan</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // --- LOGIKA ZOOM ---
    const img = document.getElementById('zoom-image');
    const zCont = document.getElementById('zoom-container');
    const btnIn = document.getElementById('btn-zoom-in');
    const btnOut = document.getElementById('btn-zoom-out');

    const updateZoom = (z) => {
        currentZoom = Math.min(Math.max(z, 1), 5);
        img.style.transform = `scale(${currentZoom})`;
        zCont.style.cursor = currentZoom > 1 ? 'move' : 'zoom-in';
    };

    btnIn.onclick = (e) => { e.stopPropagation(); updateZoom(currentZoom + 0.5); };
    btnOut.onclick = (e) => { e.stopPropagation(); updateZoom(currentZoom - 0.5); };

    zCont.onmousemove = (e) => {
        if (currentZoom > 1) {
            const { left, top, width, height } = zCont.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        }
    };

    // Logika Fullscreen
    const btnFs = document.getElementById('btn-fs');
    btnFs.onclick = (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            zCont.requestFullscreen().catch(err => {
                alert(`Error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // --- LOGIKA ROOM VIEW ---
    document.getElementById('btn-room-view').onclick = () => {
        const roomHTML = `
            <div id="room-overlay" class="fixed inset-0 z-[150] room-bg flex items-center justify-center animate-fadeIn p-10">
                <button id="close-room" class="absolute top-8 right-8 bg-white/90 px-6 py-2 rounded-full text-xs font-bold shadow-xl uppercase">Tutup</button>
                <div class="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-stone-800 transition-all duration-1000" style="width: 320px; transform: translateY(-40px);">
                    <img src="${item.image}" class="w-full h-auto">
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', roomHTML);
        document.getElementById('close-room').onclick = () => document.getElementById('room-overlay').remove();
    };

    document.getElementById('btn-close-modal').onclick = () => document.getElementById('modal-detail').remove();
};

document.addEventListener('DOMContentLoaded', fetchKatalog);