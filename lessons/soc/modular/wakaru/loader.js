// loader.js（中学受験社会・専用）: era クエリで教材データを読み込む
(function() {
  const params = new URLSearchParams(window.location.search);
  const era = params.get('era') || 'geo_land_topo'; // デフォルト：地形・気候

  // 中学受験社会：教材マップ
  const map = {
    // 地理分野 (41xx)
    'geo_land_topo': '4100_land_topography_climate.js',
    'geo_agriculture': '4101_agriculture_forestry_fishery_with_sources.js',
    'geo_prefectures': '4102_prefectures_cities_with_sources.js',
    'geo_industry': '4103_industry_energy_with_sources.js',
    'geo_commerce': '4104_commerce_trade_transportation_with_sources.js',
    'geo_environment': '4106_environment_with_sources.js',
    'geo_information': '4107_information_with_sources.js',
    'geo_maps': '4108_maps_topographic_symbols_with_sources.js',
    'geo_hokkaido': '4109_hokkaido_region_with_sources.js',
    'geo_tohoku': '4110_tohoku_region_with_sources.js',
    'geo_kanto': '4111_kanto_region_with_sources.js',
    'geo_kanto_basic': '4111_kanto_region_with_sources.js',
    'geo_chubu': '4112_chubu_region_with_sources.js',
    'geo_kinki': '4113_kinki_region_with_sources.js',
    'geo_chugoku_shikoku': '4114_chugoku_shikoku_region_with_sources.js',
    'geo_kyushu': '4115_kyushu_region_with_sources.js',
    'geo_world': '4116_world_geography_with_sources.js',
    
    // 地図学習分野 (42xx)
    '4200_map_hokkaido_with_sources': '4200_map_hokkaido_with_sources.js',
    
    // 歴史分野 (42xx)
    '4200_paleolithic_jomon_yayoi_with_sources': '4200_paleolithic_jomon_yayoi_with_sources.js',
    '4201_paleolithic_jomon_yayoi_with_sources': '4200_paleolithic_jomon_yayoi_with_sources.js',
    '4201_kofun_asuka_with_sources': '4201_kofun_asuka_with_sources.js',
    '4202_kofun_asuka_with_sources': '4201_kofun_asuka_with_sources.js',
    '4202_nara_period_with_sources': '4202_nara_period_with_sources.js',
    '4203_nara_period_with_sources': '4202_nara_period_with_sources.js',
    '4203_heian_period': '4203_heian_period.js',
    '4204_heian_period': '4203_heian_period.js',
    '4204_kamakura_period': '4204_kamakura_period.js',
    '4205_kamakura_period': '4204_kamakura_period.js',
    '4205_muromachi_period': '4205_muromachi_period.js',
    '4206_muromachi_period': '4205_muromachi_period.js',
    '4206_azuchi_momoyama': '4206_azuchi_momoyama.js',
    '4207_azuchi_momoyama': '4206_azuchi_momoyama.js',
    '4207_edo_period': '4207_edo_period.js',
    '4208_edo_period': '4207_edo_period.js',
    '4208_meiji_period': '4208_meiji_period.js',
    '4209_meiji_period': '4208_meiji_period.js',
    '4209_taisho_showa_prewar': '4209_taisho_showa_prewar.js',
    '4210_taisho_showa_prewar': '4209_taisho_showa_prewar.js',
    '4210_showa_postwar': '4210_showa_postwar.js',
    '4211_showa_postwar': '4210_showa_postwar.js',
    '4211_heisei_reiwa': '4211_heisei_reiwa.js',
    '4212_heisei_reiwa': '4211_heisei_reiwa.js',
    '4212_cross_period_problems': '4212_cross_period_problems.js',
    '4213_cross_period_problems': '4212_cross_period_problems.js',
    
    // テーマ史 (4213-4216)
    '4213_theme_politics_economy': '4213_theme_politics_economy.js',
    '4214_theme_people': '4214_theme_people.js',
    '4215_theme_diplomacy': '4215_theme_diplomacy.js',
    '4216_theme_culture': '4216_theme_culture.js',
    
    // 総合分野 (4217-4228)
    '4217_geography_theme_cross': '4217_geography_theme_cross.js',
    '4218_geography_region_comprehensive': '4218_geography_region_comprehensive.js',
    '4219_history_theme_integration': '4219_history_theme_integration.js',
    '4220_history_period_flow': '4220_history_period_flow.js',
    '4221_civics_system_composite': '4221_civics_system_composite.js',
    '4222_civics_modern_issues': '4222_civics_modern_issues.js',
    '4223_basic_integration': '4223_basic_integration.js',
    '4224_advanced_integration': '4224_advanced_integration.js',
    '4225_practice_a': '4225_practice_a.js',
    '4226_practice_b': '4226_practice_b.js',
    '4227_practice_c': '4227_practice_c.js',
    '4228_practice_d': '4228_practice_d.js',
    
    // 後方互換性のための古い形式も保持
    'hist_paleolithic': '4200_paleolithic_jomon_yayoi_with_sources.js',
    'hist_kofun': '4201_kofun_asuka_with_sources.js',
    'hist_nara': '4202_nara_period_with_sources.js',
    'hist_heian': '4203_heian_period.js',
    'hist_kamakura': '4204_kamakura_period.js',
    'hist_muromachi': '4205_muromachi_period.js',
    'hist_azuchi': '4206_azuchi_momoyama.js',
    'hist_edo': '4207_edo_period.js',
    'hist_meiji': '4208_meiji_period.js',
    'hist_taisho': '4209_taisho_showa_prewar.js',
    'hist_postwar': '4210_showa_postwar.js',
    'hist_modern': '4211_heisei_reiwa.js',
    'hist_cross': '4212_cross_period_problems.js',
    
    // 公民分野 (43xx)
    'civic_politics': '4300_politics_national_life.js',
    'civic_constitution': '4301_constitution_three_principles.js',
    'civic_government': '4302_diet_cabinet_judiciary.js',
    'civic_finance': '4303_finance_local_government.js',
    'civic_international': '4304_world_affairs_international.js',
    'civic_modern': '4305_modern_social_issues.js',
    
    // 既存の教材（後方互換性） - ダミーファイルは削除済み
    
    // 直接ファイル名でのアクセス（catalog.jsonから）
    '4100_land_topography_climate': '4100_land_topography_climate.js',
    '4101_agriculture_forestry_fishery_with_sources': '4101_agriculture_forestry_fishery_with_sources.js',
    '4102_prefectures_cities_with_sources': '4102_prefectures_cities_with_sources.js',
    '4103_industry_energy_with_sources': '4103_industry_energy_with_sources.js',
    '4104_commerce_trade_transportation_with_sources': '4104_commerce_trade_transportation_with_sources.js',
    '4106_environment_with_sources': '4106_environment_with_sources.js',
    '4107_information_with_sources': '4107_information_with_sources.js',
    '4108_maps_topographic_symbols_with_sources': '4108_maps_topographic_symbols_with_sources.js',
    '4108_maps_topographic_symbols': '4108_maps_topographic_symbols_with_sources.js',
    '4109_hokkaido_region_with_sources': '4109_hokkaido_region_with_sources.js',
    '4109_hokkaido_region': '4109_hokkaido_region_with_sources.js',
    '4110_tohoku_region_with_sources': '4110_tohoku_region_with_sources.js',
    '4110_tohoku_region': '4110_tohoku_region_with_sources.js',
    '4111_kanto_region_with_sources': '4111_kanto_region_with_sources.js',
    '4111_kanto_region': '4111_kanto_region_with_sources.js',
    '4112_chubu_region_with_sources': '4112_chubu_region_with_sources.js',
    '4112_chubu_region': '4112_chubu_region_with_sources.js',
    '4113_kinki_region_with_sources': '4113_kinki_region_with_sources.js',
    '4113_kinki_region': '4113_kinki_region_with_sources.js',
    '4114_chugoku_shikoku_region_with_sources': '4114_chugoku_shikoku_region_with_sources.js',
    '4114_chugoku_shikoku_region': '4114_chugoku_shikoku_region_with_sources.js',
    '4115_kyushu_region_with_sources': '4115_kyushu_region_with_sources.js',
    '4115_kyushu_region': '4115_kyushu_region_with_sources.js',
    '4116_world_geography_with_sources': '4116_world_geography_with_sources.js',
    '4116_world_geography': '4116_world_geography_with_sources.js',
    
    // 歴史分野の直接ファイル名でのアクセス（catalog.jsonから）
    '4201_kofun_asuka_with_sources': '4201_kofun_asuka_with_sources.js',
    '4202_nara_period_with_sources': '4202_nara_period_with_sources.js',
    '4203_heian_period': '4203_heian_period.js',
    '4204_kamakura_period': '4204_kamakura_period.js',
    '4205_muromachi_period': '4205_muromachi_period.js',
    '4206_azuchi_momoyama': '4206_azuchi_momoyama.js',
    '4207_edo_period': '4207_edo_period.js',
    '4208_meiji_period': '4208_meiji_period.js',
    '4209_taisho_showa_prewar': '4209_taisho_showa_prewar.js',
    '4210_showa_postwar': '4210_showa_postwar.js',
    '4211_heisei_reiwa': '4211_heisei_reiwa.js',
    '4212_cross_period_problems': '4212_cross_period_problems.js',
    '4213_theme_politics_economy': '4213_theme_politics_economy.js',
    '4214_theme_people': '4214_theme_people.js',
    '4215_theme_diplomacy': '4215_theme_diplomacy.js',
    '4216_theme_culture': '4216_theme_culture.js',
    '4217_geography_theme_cross': '4217_geography_theme_cross.js',
    '4218_geography_region_comprehensive': '4218_geography_region_comprehensive.js',
    '4219_history_theme_integration': '4219_history_theme_integration.js',
    '4220_history_period_flow': '4220_history_period_flow.js',
    '4221_civics_system_composite': '4221_civics_system_composite.js',
    '4222_civics_modern_issues': '4222_civics_modern_issues.js',
    '4223_basic_integration': '4223_basic_integration.js',
    '4224_advanced_integration': '4224_advanced_integration.js',
    '4225_practice_a': '4225_practice_a.js',
    '4226_practice_b': '4226_practice_b.js',
    '4227_practice_c': '4227_practice_c.js',
    '4228_practice_d': '4228_practice_d.js'
  };

  const file = map[era];
  if (!file) {
    alert('未対応の単元キーです: ' + era);
    return;
  }
  const s = document.createElement('script');
  s.src = file;
  s.onload = () => {
    if (!window.questions) {
      console.error('学習データの読み込みに失敗しました: ' + file);
    }
  };
  s.onerror = () => console.error('学習データを読み込めませんでした: ' + file);
  document.head.appendChild(s);
})();