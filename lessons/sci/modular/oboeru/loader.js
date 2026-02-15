// loader.js（中学受験理科・専用）: era クエリで教材データを読み込む
(function() {
  console.log('🚀 loader.js開始');
  const params = new URLSearchParams(window.location.search);
  const era = params.get('era') || 'sci.biology.seasons_living_things_oboeru'; // デフォルト：季節と生物（春）
  const mode = params.get('mode') || 'oboeru'; // モード取得
  console.log('🔍 loader.js: URLパラメータ取得完了', { era, mode });

  // 中学受験理科：教材マップ
  // IDからファイル名への変換: sci.biology.seasons_living_things_oboeru → biology_seasons_living_things_oboeru.js
  function idToFileName(id) {
    return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
  }
  
    const map = {
    // 生物
    'sci.biology.animal_classification_oboeru': 'biology_animal_classification_oboeru.js',
    'sci.biology.bones_muscles_senses_oboeru': 'biology_bones_muscles_senses_oboeru.js',
    'sci.biology.digestion_absorption_oboeru': 'biology_digestion_absorption_oboeru.js',
    'sci.biology.environment_energy_oboeru': 'biology_environment_energy_oboeru.js',
    'sci.biology.food_chain_oboeru': 'biology_food_chain_oboeru.js',
    'sci.biology.heart_blood_circulation_oboeru': 'biology_heart_blood_circulation_oboeru.js',
    'sci.biology.human_birth_oboeru': 'biology_human_birth_oboeru.js',
    'sci.biology.human_body_digestion_respiration_oboeru': 'biology_human_body_digestion_respiration_oboeru.js',
    'sci.biology.human_body_nervous_motion_oboeru': 'biology_human_body_nervous_motion_oboeru.js',
    'sci.biology.insect_body_lifecycle_oboeru': 'biology_insect_body_lifecycle_oboeru.js',
    'sci.biology.living_things_seasons_oboeru': 'biology_living_things_seasons_oboeru.js',
    'sci.biology.medaka_lifecycle_oboeru': 'biology_medaka_lifecycle_oboeru.js',
    'sci.biology.microscope_water_organisms_oboeru': 'biology_microscope_water_organisms_oboeru.js',
    'sci.biology.photosynthesis_oboeru': 'biology_photosynthesis_oboeru.js',
    'sci.biology.plant_classification_oboeru': 'biology_plant_classification_oboeru.js',
    'sci.biology.plant_structure_oboeru': 'biology_plant_structure_oboeru.js',
    'sci.biology.plant_structure_transpiration_integrated_oboeru': 'biology_plant_structure_transpiration_integrated_oboeru.js',
    'sci.biology.plants_growth_light_oboeru': 'biology_plants_growth_light_oboeru.js',
    'sci.biology.plants_observation_oboeru': 'biology_plants_observation_oboeru.js',
    'sci.biology.respiration_excretion_oboeru': 'biology_respiration_excretion_oboeru.js',
    'sci.biology.seasons_living_things_oboeru': 'seasons_living_things_spring.js',
    'sci.biology.seasons_living_things_summer_oboeru': 'biology_seasons_living_things_summer_oboeru.js',
    'sci.biology.seeds_germination_oboeru': 'biology_seeds_germination_oboeru.js',
    'sci.biology.transpiration_respiration_oboeru': 'biology_transpiration_respiration_oboeru.js',
    // 化学
    'sci.chemistry.air_combustion_integrated_oboeru': 'chemistry_air_combustion_integrated_oboeru.js',    'sci.chemistry.dissolution_solution_oboeru': 'chemistry_dissolution_solution_oboeru.js',
    'sci.chemistry.neutralization_oboeru': 'chemistry_neutralization_oboeru.js',
    'sci.chemistry.physics_heat_transfer_oboeru': 'chemistry_physics_heat_transfer_oboeru.js',
    'sci.chemistry.physics_lab_equipment_oboeru': 'chemistry_physics_lab_equipment_oboeru.js',    'sci.chemistry.solution_integrated_oboeru': 'chemistry_solution_integrated_oboeru.js',
    'sci.chemistry.solution_metal_reaction_oboeru': 'chemistry_solution_metal_reaction_oboeru.js',
    'sci.chemistry.various_gases_oboeru': 'chemistry_various_gases_oboeru.js',
    'sci.chemistry.water_state_integrated_oboeru': 'chemistry_water_state_integrated_oboeru.js',    // 総合
    'sci.comprehensive.animals_comprehensive_oboeru': 'comprehensive_animals_comprehensive_oboeru.js',
    'sci.comprehensive.astronomy_comprehensive_oboeru': 'comprehensive_astronomy_comprehensive_oboeru.js',
    'sci.comprehensive.biology_comprehensive_oboeru': 'comprehensive_biology_comprehensive_oboeru.js',
    'sci.comprehensive.chemistry_comprehensive_oboeru': 'comprehensive_chemistry_comprehensive_oboeru.js',
    'sci.comprehensive.combustion_comprehensive_oboeru': 'comprehensive_combustion_comprehensive_oboeru.js',
    'sci.comprehensive.earth_science_comprehensive_oboeru': 'comprehensive_earth_science_comprehensive_oboeru.js',
    'sci.comprehensive.electricity_comprehensive_oboeru': 'comprehensive_electricity_comprehensive_oboeru.js',
    'sci.comprehensive.human_body_comprehensive_oboeru': 'comprehensive_human_body_comprehensive_oboeru.js',
    'sci.comprehensive.light_sound_comprehensive_oboeru': 'comprehensive_light_sound_comprehensive_oboeru.js',
    'sci.comprehensive.mechanics_comprehensive_oboeru': 'comprehensive_mechanics_comprehensive_oboeru.js',
    'sci.comprehensive.physics_comprehensive_advanced_oboeru': 'comprehensive_physics_comprehensive_advanced_oboeru.js',
    'sci.comprehensive.physics_comprehensive_oboeru': 'comprehensive_physics_comprehensive_oboeru.js',
    'sci.comprehensive.strata_comprehensive_oboeru': 'comprehensive_strata_comprehensive_oboeru.js',
    'sci.comprehensive.water_solution_comprehensive_oboeru': 'comprehensive_water_solution_comprehensive_oboeru.js',
    'sci.comprehensive.weather_comprehensive_oboeru': 'comprehensive_weather_comprehensive_oboeru.js',
    // 地学
    'sci.earth.clouds_fronts_weather_map_oboeru': 'earth_clouds_fronts_weather_map_oboeru.js',    'sci.earth.earthquake_basic_oboeru': 'earth_earthquake_basic_oboeru.js',
    'sci.earth.earthquake_structure_oboeru': 'earth_earthquake_structure_oboeru.js',
    'sci.earth.fossils_strata_oboeru': 'earth_fossils_strata_oboeru.js',
    'sci.earth.front_weather_land_sea_breeze_oboeru': 'earth_front_weather_land_sea_breeze_oboeru.js',
    'sci.earth.japan_weather_oboeru': 'earth_japan_weather_oboeru.js',
    'sci.earth.land_river_erosion_oboeru': 'earth_land_river_erosion_oboeru.js',
    'sci.earth.moon_movement_oboeru': 'earth_moon_movement_oboeru.js',
    'sci.earth.river_work_oboeru': 'earth_river_work_oboeru.js',
    'sci.earth.rocks_oboeru': 'earth_rocks_oboeru.js',
    'sci.earth.solar_system_oboeru': 'earth_solar_system_oboeru.js',
    'sci.earth.stars_constellations_integrated_oboeru': 'earth_stars_constellations_integrated_oboeru.js',
    'sci.earth.strata_formation_oboeru': 'earth_strata_formation_oboeru.js',
    'sci.earth.sun_movement_oboeru': 'earth_sun_movement_oboeru.js',
    'sci.earth.sun_movement_shadow_oboeru': 'earth_sun_movement_shadow_oboeru.js',
    'sci.earth.temperature_changes_oboeru': 'earth_temperature_changes_oboeru.js',
    'sci.earth.various_landforms_oboeru': 'earth_various_landforms_oboeru.js',
    'sci.earth.volcano_structure_land_change_integrated_oboeru': 'earth_volcano_structure_land_change_integrated_oboeru.js',    'sci.earth.weather_changes_oboeru': 'earth_weather_changes_oboeru.js',
    'sci.earth.weather_observation_pressure_wind_oboeru': 'earth_weather_observation_pressure_wind_oboeru.js',
    // 物理
    'sci.physics.balance_oboeru': 'physics_balance_oboeru.js',
    'sci.physics.current_circuit_integrated_oboeru': 'physics_current_circuit_integrated_oboeru.js',
    'sci.physics.current_compass_oboeru': 'physics_current_compass_oboeru.js',
    'sci.physics.current_effect_heating_oboeru': 'physics_current_effect_heating_oboeru.js',
    'sci.physics.current_effect_magnetic_oboeru': 'physics_current_effect_magnetic_oboeru.js',
    'sci.physics.current_magnitude_oboeru': 'physics_current_magnitude_oboeru.js',
    'sci.physics.current_voltage_circuit_oboeru': 'physics_current_voltage_circuit_oboeru.js',
    'sci.physics.electricity_conductivity_basic_oboeru': 'physics_electricity_conductivity_basic_oboeru.js',    'sci.physics.force_motion_pulley_integrated_oboeru': 'physics_force_motion_pulley_integrated_oboeru.js',
    'sci.physics.heat_properties_oboeru': 'physics_heat_properties_oboeru.js',
    'sci.physics.lever_weight_basic_oboeru': 'physics_lever_weight_basic_oboeru.js',
    'sci.physics.light_properties_oboeru': 'physics_light_properties_oboeru.js',
    'sci.physics.light_reflection_refraction_oboeru': 'physics_light_reflection_refraction_oboeru.js',
    'sci.physics.moving_weight_oboeru': 'physics_moving_weight_oboeru.js',
    'sci.physics.pendulum_moving_weight_integrated_oboeru': 'physics_pendulum_moving_weight_integrated_oboeru.js',
    'sci.physics.pendulum_oboeru': 'physics_pendulum_oboeru.js',
    'sci.physics.sound_properties_oboeru': 'physics_sound_properties_oboeru.js',
    'sci.physics.spring_force_buoyancy_integrated_oboeru': 'physics_spring_force_buoyancy_integrated_oboeru.js',    'sci.physics.weight_volume_basic_oboeru': 'physics_weight_volume_basic_oboeru.js',
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
    console.log('🔍 window.questionsの状態:', window.questions ? `配列、長さ=${window.questions.length}` : 'undefined');
    if (!window.questions) {
      console.error('❌ 学習データの読み込みに失敗しました: ' + file + ' (window.questionsが定義されていません)');
      console.error('❌ ファイルの内容を確認してください');
    } else {
      console.log('✅ window.questionsが読み込まれました: ' + window.questions.length + '問');
      // 最初の問題を確認
      if (window.questions.length > 0) {
        console.log('📝 最初の問題:', window.questions[0].text ? window.questions[0].text.substring(0, 30) + '...' : '問題データなし');
      }
    }
  };
  s.onerror = (error) => {
    console.error('❌ 学習データを読み込めませんでした: ' + file);
    console.error('❌ ファイルパス: ' + s.src);
    console.error('❌ エラー詳細:', error);
    console.error('❌ ファイルが存在するか確認してください');
  };
  console.log('📤 スクリプトタグを作成して読み込み開始: ' + file);
  document.head.appendChild(s);
})();

