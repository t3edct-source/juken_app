// loader.js（中学受験理科・専用）: era クエリで教材データを読み込む
(function() {
  const params = new URLSearchParams(window.location.search);
  const era = params.get('era') || 'seasons_living_things_spring'; // デフォルト：季節と生物（春）
  const mode = params.get('mode') || 'oboeru'; // モード取得

  // 中学受験理科：教材マップ
  // IDからファイル名への変換: sci.biology.seasons_living_things_oboeru → biology_seasons_living_things_oboeru.js
  function idToFileName(id) {
    return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
  }
  
  const map = {
    // 小4理科（生物）
    'sci.biology.seasons_living_things_oboeru': 'seasons_living_things_spring.js',
    'sci.biology.seasons_living_things_summer_oboeru': 'biology_seasons_living_things_summer_oboeru.js',
    'sci.biology.plants_growth_light_oboeru': idToFileName('sci.biology.plants_growth_light_oboeru'),
    'sci.biology.plants_observation_oboeru': idToFileName('sci.biology.plants_observation_oboeru'),
    
    // 小4理科（物理）
    'sci.physics.weight_volume_basic_oboeru': idToFileName('sci.physics.weight_volume_basic_oboeru'),
    'sci.physics.electricity_conductivity_basic_oboeru': idToFileName('sci.physics.electricity_conductivity_basic_oboeru'),
    'sci.physics.heat_properties_oboeru': idToFileName('sci.physics.heat_properties_oboeru'),
    
    // 小4理科（化学）
    'sci.chemistry.air_properties_oboeru': idToFileName('sci.chemistry.air_properties_oboeru'),
    'sci.chemistry.water_three_states_oboeru': idToFileName('sci.chemistry.water_three_states_oboeru'),
    'sci.chemistry.combustion_air_oboeru': idToFileName('sci.chemistry.combustion_air_oboeru'),
    
    // 小4理科（地学）
    'sci.earth.constellations_seasons_oboeru': idToFileName('sci.earth.constellations_seasons_oboeru'),
    'sci.earth.sun_movement_shadow_oboeru': idToFileName('sci.earth.sun_movement_shadow_oboeru'),
    'sci.earth.weather_changes_oboeru': idToFileName('sci.earth.weather_changes_oboeru'),
    'sci.earth.river_work_oboeru': idToFileName('sci.earth.river_work_oboeru'),
    
    // 小5理科（物理）
    'sci.physics.current_voltage_circuit_oboeru': idToFileName('sci.physics.current_voltage_circuit_oboeru'),
    'sci.physics.current_effect_heating_oboeru': idToFileName('sci.physics.current_effect_heating_oboeru'),
    'sci.physics.current_effect_magnetic_oboeru': idToFileName('sci.physics.current_effect_magnetic_oboeru'),
    'sci.physics.lever_weight_basic_oboeru': idToFileName('sci.physics.lever_weight_basic_oboeru'),
    'sci.physics.spring_force_oboeru': idToFileName('sci.physics.spring_force_oboeru'),
    'sci.physics.light_properties_oboeru': idToFileName('sci.physics.light_properties_oboeru'),
    'sci.physics.force_motion_oboeru': idToFileName('sci.physics.force_motion_oboeru'),
    
    // 小5理科（地学）
    'sci.earth.volcano_structure_oboeru': idToFileName('sci.earth.volcano_structure_oboeru'),
    'sci.earth.earthquake_structure_oboeru': idToFileName('sci.earth.earthquake_structure_oboeru'),
    'sci.earth.land_river_erosion_oboeru': idToFileName('sci.earth.land_river_erosion_oboeru'),
    'sci.earth.clouds_fronts_weather_map_oboeru': idToFileName('sci.earth.clouds_fronts_weather_map_oboeru'),
    
    // 小5理科（生物）
    'sci.biology.food_chain_oboeru': idToFileName('sci.biology.food_chain_oboeru'),
    'sci.biology.human_body_digestion_respiration_oboeru': idToFileName('sci.biology.human_body_digestion_respiration_oboeru'),
    'sci.biology.human_body_nervous_motion_oboeru': idToFileName('sci.biology.human_body_nervous_motion_oboeru'),
    
    // 小5理科（化学）
    'sci.chemistry.solubility_temperature_oboeru': idToFileName('sci.chemistry.solubility_temperature_oboeru'),
    
    // 小6理科（総合）
    'sci.comprehensive.electricity_comprehensive_oboeru': idToFileName('sci.comprehensive.electricity_comprehensive_oboeru'),
    'sci.comprehensive.light_sound_comprehensive_oboeru': idToFileName('sci.comprehensive.light_sound_comprehensive_oboeru'),
    'sci.comprehensive.mechanics_comprehensive_oboeru': idToFileName('sci.comprehensive.mechanics_comprehensive_oboeru'),
    'sci.comprehensive.combustion_comprehensive_oboeru': idToFileName('sci.comprehensive.combustion_comprehensive_oboeru'),
    'sci.comprehensive.water_solution_comprehensive_oboeru': idToFileName('sci.comprehensive.water_solution_comprehensive_oboeru'),
    'sci.comprehensive.animals_comprehensive_oboeru': idToFileName('sci.comprehensive.animals_comprehensive_oboeru'),
    'sci.comprehensive.human_body_comprehensive_oboeru': idToFileName('sci.comprehensive.human_body_comprehensive_oboeru'),
    'sci.comprehensive.astronomy_comprehensive_oboeru': idToFileName('sci.comprehensive.astronomy_comprehensive_oboeru'),
    'sci.comprehensive.strata_comprehensive_oboeru': idToFileName('sci.comprehensive.strata_comprehensive_oboeru'),
    'sci.comprehensive.weather_comprehensive_oboeru': idToFileName('sci.comprehensive.weather_comprehensive_oboeru')
  };

  // eraパラメータの検証
  console.log('🔍 デバッグ: eraパラメータ =', era);
  console.log('🔍 デバッグ: eraパラメータの型 =', typeof era);
  console.log('🔍 デバッグ: eraパラメータの長さ =', era ? era.length : 0);
  
  const file = map[era];
  if (!file) {
    console.error('❌ 未対応の単元キーです: ' + era);
    console.error('❌ eraパラメータの詳細:', JSON.stringify(era));
    console.error('❌ マッピングに存在するキー:', Object.keys(map).join(', '));
    alert('未対応の単元キーです: ' + era);
    return;
  }
  
  console.log('📚 loader.js: era=', era, 'mode=', mode, 'file=', file);
  
  // oboeruモードではoboeruディレクトリ内のファイルを読み込む
  const filePath = file;
  
  console.log('📚 最終的な読み込みファイルパス:', filePath);
  
  const s = document.createElement('script');
  s.src = filePath;
  s.onload = () => {
    console.log('📚 スクリプト読み込み完了:', filePath);
    console.log('📚 window.questions の状態:', window.questions ? `${window.questions.length}個の質問` : 'undefined');
    if (!window.questions) {
      console.error('❌ 学習データの読み込みに失敗しました: ' + filePath);
      console.error('❌ window.questions が undefined です');
    } else {
      console.log('✅ 学習データの読み込み成功:', filePath, '質問数:', window.questions.length);
    }
  };
  s.onerror = () => {
    console.error('❌ スクリプトの読み込みエラー:', filePath);
    console.error('❌ ファイルが見つかりませんでした');
  };
  document.head.appendChild(s);
})();

