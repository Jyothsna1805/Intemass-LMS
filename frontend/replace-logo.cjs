const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const fullPath = path.join(srcDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace Dashboard style
    content = content.replace(
        /<div className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-white text-\[10px\] font-bold bg-black\/30">\s*MEGA\s*<\/div>/g,
        `<img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />`
    );

    // Replace Login/Register style
    content = content.replace(
        /<div className="h-16 w-16 rounded-full border-4 border-primary-900 flex items-center justify-center text-primary-900 text-sm font-black tracking-tighter mb-4 shadow-sm bg-white">\s*MEGA\s*<\/div>/g,
        `<img src="/logo.png" alt="MegaForte" className="h-28 w-28 object-contain mb-4 shadow-md bg-white rounded-full" />`
    );

    // Replace Landing style
    content = content.replace(
        /<div className="h-12 w-12 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold leading-none tracking-tighter">\s*MEGA\s*<\/div>/g,
        `<img src="/logo.png" alt="MegaForte" className="h-14 w-14 object-contain bg-white rounded-full shadow-sm" />`
    );

    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Replaced all logos successfully');
