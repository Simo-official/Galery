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