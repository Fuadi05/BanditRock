const fs = require('fs');
let html = fs.readFileSync('D:/git/BanditRock/detail.html', 'utf8');
html = html.replace(/\\`/g, '`').replace(/\\\${/g, '${');
fs.writeFileSync('D:/git/BanditRock/detail.html', html);
console.log('Fixed detail.html');
