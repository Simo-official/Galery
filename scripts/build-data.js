const fs = require('fs');
const path = require('path');

const inputDir = './content/produk';
const outputFile = './content/katalog-semua.json';

// Pastikan folder output ada
if (!fs.existsSync('./content')) {
    fs.mkdirSync('./content');
}

try {
    const files = fs.readdirSync(inputDir);
    const allData = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const filePath = path.join(inputDir, file);
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        });

    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
    console.log(`✅ Berhasil menggabungkan ${allData.length} produk ke ${outputFile}`);
} catch (error) {
    console.error("❌ Gagal menggabungkan data:", error);
    // Buat file kosong agar build tidak error jika folder produk masih kosong
    fs.writeFileSync(outputFile, JSON.stringify([]));
}