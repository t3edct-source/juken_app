// loader.js（中学受験理科・専用）: era クエリで教材データを読み込む
(function() {
  const params = new URLSearchParams(window.location.search);
  const era = params.get('era') || 'seasons_living_things_spring'; // デフォルト：季節と生物（春）

  // 中学受験理科：教材マップ
  // IDからファイル名への変換: sci.biology.seasons_living_things → biology_seasons_living_things.js
  function idToFileName(id) {
    return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
  }
  
  const map = {
    // 小4理科（生物）
    'sci.biology.seasons_living_things': 'seasons_living_things_spring.js',
    'sci.biology.seasons_living_things_summer': idToFileName('sci.biology.seasons_living_things_summer'),
    'sci.biology.insect_body_lifecycle': idToFileName('sci.biology.insect_body_lifecycle'),
    'sci.biology.medaka_lifecycle': idToFileName('sci.biology.medaka_lifecycle'),
    'sci.biology.microscope_water_organisms': idToFileName('sci.biology.microscope_water_organisms'),
    'sci.biology.animal_classification': idToFileName('sci.biology.animal_classification'),
    'sci.biology.living_things_seasons': idToFileName('sci.biology.living_things_seasons'),
    'sci.biology.environment_energy': idToFileName('sci.biology.environment_energy'),
    'sci.biology.bones_muscles_senses': idToFileName('sci.biology.bones_muscles_senses'),
    'sci.biology.human_birth': idToFileName('sci.biology.human_birth'),
    'sci.biology.seeds_germination': idToFileName('sci.biology.seeds_germination'),
    'sci.biology.plants_growth_light': idToFileName('sci.biology.plants_growth_light'),
    'sci.biology.photosynthesis': idToFileName('sci.biology.photosynthesis'),
    'sci.biology.plant_structure_transpiration_integrated': 'biology_plant_structure_transpiration_integrated.js', // 植物のつくりとはたらき（統合）
    'sci.biology.plants_observation': idToFileName('sci.biology.plants_observation'),
    'sci.biology.plant_classification': idToFileName('sci.biology.plant_classification'),
    'sci.biology.digestion_absorption': idToFileName('sci.biology.digestion_absorption'),
    'sci.biology.heart_blood_circulation': idToFileName('sci.biology.heart_blood_circulation'),
    'sci.biology.respiration_excretion': idToFileName('sci.biology.respiration_excretion'),
    
    // 小4理科（物理）
    'sci.physics.weight_volume_basic': idToFileName('sci.physics.weight_volume_basic'),
    'sci.physics.electricity_conductivity_basic': idToFileName('sci.physics.electricity_conductivity_basic'),
    'sci.physics.heat_properties': idToFileName('sci.physics.heat_properties'),
    
    // 小4理科（化学）
    'sci.chemistry.air_combustion_integrated': 'chemistry_air_combustion_integrated.js', // 空気と燃焼
    'sci.chemistry.water_state_integrated': 'chemistry_water_state_integrated.js', // 水の状態変化（統合）
    'sci.chemistry.solution_integrated': 'chemistry_solution_integrated.js', // 水溶液（溶解度・とけ方・濃さ）（統合）
    
    // 小4理科（地学）
    'sci.earth.stars_constellations_integrated': 'earth_stars_constellations_integrated.js', // 星と星座・星の動き（統合）
    'sci.earth.sun_movement_shadow': idToFileName('sci.earth.sun_movement_shadow'),
    'sci.earth.sun_movement': idToFileName('sci.earth.sun_movement'),
    'sci.earth.moon_movement': idToFileName('sci.earth.moon_movement'),
    'sci.earth.solar_system': idToFileName('sci.earth.solar_system'),
    'sci.earth.weather_changes': idToFileName('sci.earth.weather_changes'),
    'sci.earth.river_work': idToFileName('sci.earth.river_work'),
    
    // 小5理科（物理）
    'sci.physics.current_circuit_integrated': 'physics_current_circuit_integrated.js',
    'sci.physics.current_effect_heating': 'physics_current_effect_heating.js',
    'sci.physics.current_effect_magnetic': 'physics_current_effect_magnetic.js',
    'sci.physics.lever_weight_basic': idToFileName('sci.physics.lever_weight_basic'),
    'sci.physics.spring_force_buoyancy_integrated': 'physics_spring_force_buoyancy_integrated.js', // ばねと力・ばねと浮力統合版
    'sci.physics.light_properties': idToFileName('sci.physics.light_properties'),
    'sci.physics.light_reflection_refraction': 'physics_light_reflection_refraction.js',
    'sci.physics.sound_properties': 'physics_sound_properties.js',
    'sci.physics.force_motion_pulley_integrated': 'physics_force_motion_pulley_integrated.js', // 力と運動（浮力・かっ車・輪じく）統合版
    'sci.physics.pendulum_moving_weight_integrated': 'physics_pendulum_moving_weight_integrated.js', // ふりことおもりの運動（統合）
    'sci.physics.balance': idToFileName('sci.physics.balance'),
    'sci.physics.current_compass': idToFileName('sci.physics.current_compass'),
    
    // 小5理科（地学）
    'sci.earth.volcano_structure_land_change_integrated': 'earth_volcano_structure_land_change_integrated.js', // 火山のしくみ・火山と大地の変化統合版
    'sci.earth.earthquake_basic': idToFileName('sci.earth.earthquake_basic'), // 地震の基礎
    'sci.earth.earthquake_structure': idToFileName('sci.earth.earthquake_structure'), // 地震のしくみ（詳細）
    'sci.earth.strata_formation': idToFileName('sci.earth.strata_formation'),
    'sci.earth.rocks': idToFileName('sci.earth.rocks'),
    'sci.earth.various_landforms': idToFileName('sci.earth.various_landforms'),
    'sci.earth.fossils_strata': idToFileName('sci.earth.fossils_strata'),
    'sci.earth.land_river_erosion': idToFileName('sci.earth.land_river_erosion'),
    'sci.earth.weather_observation_pressure_wind': idToFileName('sci.earth.weather_observation_pressure_wind'),
    'sci.earth.temperature_changes': idToFileName('sci.earth.temperature_changes'),
    'sci.earth.front_weather_land_sea_breeze': idToFileName('sci.earth.front_weather_land_sea_breeze'),
    'sci.earth.japan_weather': idToFileName('sci.earth.japan_weather'),
    'sci.earth.clouds_fronts_weather_map': idToFileName('sci.earth.clouds_fronts_weather_map'),
    
    // 小5理科（生物）
    'sci.biology.food_chain': idToFileName('sci.biology.food_chain'),
    'sci.biology.human_body_digestion_respiration': idToFileName('sci.biology.human_body_digestion_respiration'),
    'sci.biology.human_body_nervous_motion': idToFileName('sci.biology.human_body_nervous_motion'),
    
    // 小5理科（化学）
    'sci.chemistry.solution_integrated': 'chemistry_solution_integrated.js', // 水溶液（溶解度・とけ方・濃さ）（統合）
    'sci.chemistry.neutralization': idToFileName('sci.chemistry.neutralization'),
    'sci.chemistry.solution_metal_reaction': idToFileName('sci.chemistry.solution_metal_reaction'),
    'sci.chemistry.various_gases': idToFileName('sci.chemistry.various_gases'),
    'sci.chemistry.physics.heat_transfer': 'chemistry_physics_heat_transfer.js',
    // 'sci.chemistry.physics.volume_change': 'chemistry_physics_volume_change.js', // 削除済み
    'sci.chemistry.physics.lab_equipment': 'chemistry_physics_lab_equipment.js',
    
    // 小6理科（総合）
    'sci.comprehensive.electricity_comprehensive': idToFileName('sci.comprehensive.electricity_comprehensive'),
    'sci.comprehensive.light_sound_comprehensive': idToFileName('sci.comprehensive.light_sound_comprehensive'),
    'sci.comprehensive.mechanics_comprehensive': idToFileName('sci.comprehensive.mechanics_comprehensive'),
    'sci.comprehensive.combustion_comprehensive': idToFileName('sci.comprehensive.combustion_comprehensive'),
    'sci.comprehensive.water_solution_comprehensive': idToFileName('sci.comprehensive.water_solution_comprehensive'),
    'sci.comprehensive.animals_comprehensive': idToFileName('sci.comprehensive.animals_comprehensive'),
    'sci.comprehensive.human_body_comprehensive': idToFileName('sci.comprehensive.human_body_comprehensive'),
    'sci.comprehensive.astronomy_comprehensive': idToFileName('sci.comprehensive.astronomy_comprehensive'),
    'sci.comprehensive.strata_comprehensive': idToFileName('sci.comprehensive.strata_comprehensive'),
    'sci.comprehensive.weather_comprehensive': idToFileName('sci.comprehensive.weather_comprehensive'),
    'sci.comprehensive.physics_comprehensive': idToFileName('sci.comprehensive.physics_comprehensive'),
    'sci.comprehensive.physics_comprehensive_advanced': 'comprehensive_physics_comprehensive_advanced.js',
    'sci.comprehensive.chemistry_comprehensive': idToFileName('sci.comprehensive.chemistry_comprehensive'),
    'sci.comprehensive.biology_comprehensive': idToFileName('sci.comprehensive.biology_comprehensive'),
    'sci.comprehensive.earth_science_comprehensive': idToFileName('sci.comprehensive.earth_science_comprehensive')
  };

  const file = map[era];
  if (!file) {
    alert('未対応の単元キーです: ' + era);
    return;
  }
  console.log('📚 読み込み開始: era=' + era + ', file=' + file);
  const s = document.createElement('script');
  s.src = file;
  s.onload = () => {
    console.log('✅ ファイル読み込み成功: ' + file);
    if (!window.questions) {
      console.error('❌ 学習データの読み込みに失敗しました: ' + file + ' (window.questionsが定義されていません)');
    } else {
      console.log('✅ window.questionsが読み込まれました: ' + window.questions.length + '問');
    }
  };
  s.onerror = () => {
    console.error('❌ 学習データを読み込めませんでした: ' + file);
    console.error('ファイルパス: ' + s.src);
  };
  document.head.appendChild(s);
})();
