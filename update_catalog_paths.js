const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

let updated = 0;
for (const entry of catalog) {
  if (entry.subject === 'sci' || entry.subject === 'science_drill') {
    const oldPath = entry.path;
    // modularパスでない場合のみ更新
    if (!oldPath.includes('modular')) {
      if (entry.subject === 'sci') {
        entry.path = `lessons/sci/modular/wakaru/index_modular.html?era=${entry.id}&mode=wakaru`;
      } else if (entry.subject === 'science_drill') {
        entry.path = `lessons/sci/modular/oboeru/index_modular.html?era=${entry.id}&mode=oboeru`;
      }
      updated++;
      console.log(`更新: ${entry.id} -> ${entry.path}`);
    }
  }
}

fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`\n✅ ${updated}個のpathを更新しました`);

