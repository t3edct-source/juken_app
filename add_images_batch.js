const fs = require('fs');
const path = require('path');

// 各レッスンの画像配置設定
const lessons = [
  {
    file: 'lessons/sci/modular/wakaru/physics_current_effect_heating.js',
    folder: 'current_effect_heating',
    subject: 'physics',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/physics_current_circuit_integrated.js',
    folder: 'current_circuit_integrated',
    subject: 'physics',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/chemistry_neutralization.js',
    folder: 'neutralization',
    subject: 'chemistry',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/chemistry_solution_metal_reaction.js',
    folder: 'solution_metal_reaction',
    subject: 'chemistry',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/biology_human_body_digestion_respiration.js',
    folder: 'human_body_digestion_respiration',
    subject: 'biology',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/biology_environment_energy.js',
    folder: 'environment_energy',
    subject: 'biology',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/biology_human_birth.js',
    folder: 'human_birth',
    subject: 'biology',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/biology_bones_muscles_senses.js',
    folder: 'bones_muscles_senses',
    subject: 'biology',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/biology_respiration_excretion.js',
    folder: 'respiration_excretion',
    subject: 'biology',
    images: {}
  },
  {
    file: 'lessons/sci/modular/wakaru/biology_heart_blood_circulation.js',
    folder: 'heart_blood_circulation',
    subject: 'biology',
    images: {}
  }
];

// 画像ファイル名のパターンを設定
lessons.forEach(lesson => {
  const imageDir = `lessons/sci/modular/images/${lesson.subject}/${lesson.folder}`;
  
  if (!fs.existsSync(imageDir)) {
    console.log(`⚠ ${imageDir} が見つかりません`);
    return;
  }
  
  const files = fs.readdirSync(imageDir);
  
  files.forEach(file => {
    // ファイル名から問題番号を抽出
    let qnum = null;
    
    if (lesson.subject === 'physics') {
      // physics: sci.physics.current_effect_heating&mode1.jpg
      const match = file.match(/mode(\d+)\.(jpg|png)/);
      if (match) {
        qnum = parseInt(match[1]);
      }
    } else if (lesson.subject === 'chemistry') {
      // chemistry: neutralization1.png, solution_metal_reaction1.png
      const match = file.match(/(\d+)\.(jpg|png)/);
      if (match) {
        qnum = parseInt(match[1]);
      }
    } else if (lesson.subject === 'biology') {
      // biology: human_body_digestion_respiration1.png, environment_energy1.png, etc.
      const match = file.match(/(\d+)\.(jpg|png)/);
      if (match) {
        qnum = parseInt(match[1]);
      }
    }
    
    if (qnum) {
      lesson.images[qnum] = file;
    }
  });
});

// 各レッスンファイルに画像を配置
lessons.forEach(lesson => {
  if (!fs.existsSync(lesson.file)) {
    console.log(`⚠ ${lesson.file} が見つかりません`);
    return;
  }
  
  let content = fs.readFileSync(lesson.file, 'utf8');
  let changed = false;
  
  // 各問題のsourceフィールド内のテキスト図解を画像に置き換え
  Object.keys(lesson.images).forEach(qnum => {
    const qnumInt = parseInt(qnum);
    const imageName = lesson.images[qnum];
    const imagePath = `../images/${lesson.subject}/${lesson.folder}/${imageName}`;
    
    // 問題番号に対応するsourceフィールドを探す（複数のパターンに対応）
    const patterns = [
      // パターン1: <div style="font-family: monospace...
      new RegExp(
        `("qnum":\\s*${qnumInt}[^}]*?"source":\\s*"[^"]*?)(<div[^>]*style[^>]*>.*?</div>)`,
        's'
      ),
      // パターン2: <div style="font-family: 'Courier New'...
      new RegExp(
        `("qnum":\\s*${qnumInt}[^}]*?"source":\\s*"[^"]*?)(<div[^>]*>.*?</div>)`,
        's'
      )
    ];
    
    for (const regex of patterns) {
      if (content.match(regex)) {
        content = content.replace(
          regex,
          `$1<img src="${imagePath}" alt="図解" style="max-width: 100%; margin: 1rem 0; border-radius: 8px; display: block;">`
        );
        changed = true;
        console.log(`✓ ${lesson.file}: Q${qnum} に画像を配置`);
        break;
      }
    }
  });
  
  if (changed) {
    fs.writeFileSync(lesson.file, content, 'utf8');
    console.log(`✓ ${lesson.file} を更新しました`);
  } else {
    console.log(`- ${lesson.file}: 画像を配置する問題が見つかりませんでした`);
  }
});

console.log('\n完了しました！');

