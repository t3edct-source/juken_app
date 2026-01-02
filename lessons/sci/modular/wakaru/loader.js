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
    'sci.biology.plant_structure': idToFileName('sci.biology.plant_structure'),
    'sci.biology.transpiration_respiration': idToFileName('sci.biology.transpiration_respiration'),
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
    'sci.chemistry.air_properties': idToFileName('sci.chemistry.air_properties'),
    'sci.chemistry.water_three_states': idToFileName('sci.chemistry.water_three_states'),
    'sci.chemistry.combustion_air': idToFileName('sci.chemistry.combustion_air'),
    
    // 小4理科（地学）
    'sci.earth.constellations_seasons': idToFileName('sci.earth.constellations_seasons'),
    'sci.earth.sun_movement_shadow': idToFileName('sci.earth.sun_movement_shadow'),
    'sci.earth.sun_movement': idToFileName('sci.earth.sun_movement'),
    'sci.earth.moon_movement': idToFileName('sci.earth.moon_movement'),
    'sci.earth.stars_movement': idToFileName('sci.earth.stars_movement'),
    'sci.earth.seasonal_constellations': idToFileName('sci.earth.seasonal_constellations'),
    'sci.earth.solar_system': idToFileName('sci.earth.solar_system'),
    'sci.earth.weather_changes': idToFileName('sci.earth.weather_changes'),
    'sci.earth.river_work': idToFileName('sci.earth.river_work'),
    
    // 小5理科（物理）
    'sci.physics.current_voltage_circuit': idToFileName('sci.physics.current_voltage_circuit'),
    'sci.physics.current_effect_heating': 'physics_current_effect_heating.js',
    'sci.physics.current_effect_magnetic': 'physics_current_effect_magnetic.js',
    'sci.physics.lever_weight_basic': idToFileName('sci.physics.lever_weight_basic'),
    'sci.physics.spring_force': idToFileName('sci.physics.spring_force'),
    'sci.physics.light_properties': idToFileName('sci.physics.light_properties'),
    'sci.physics.light_reflection_refraction': 'physics_light_reflection_refraction.js',
    'sci.physics.sound_properties': 'physics_sound_properties.js',
    'sci.physics.force_motion': idToFileName('sci.physics.force_motion'),
    
    // 小5理科（地学）
    'sci.earth.volcano_structure': idToFileName('sci.earth.volcano_structure'),
    'sci.earth.earthquake_structure': idToFileName('sci.earth.earthquake_structure'),
    'sci.earth.strata_formation': idToFileName('sci.earth.strata_formation'),
    'sci.earth.various_landforms': idToFileName('sci.earth.various_landforms'),
    'sci.earth.volcano_land_change': idToFileName('sci.earth.volcano_land_change'),
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
    'sci.chemistry.solubility_temperature': idToFileName('sci.chemistry.solubility_temperature'),
    'sci.chemistry.dissolution_solution': 'chemistry_dissolution_solution.js',
    
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
    'sci.comprehensive.weather_comprehensive': idToFileName('sci.comprehensive.weather_comprehensive')
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
