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
    'geo_world': '4116_world_geography.js',
    
    // 歴史分野 (42xx)
    'hist_paleolithic': '4200_paleolithic_jomon_yayoi.js',
    'hist_kofun': '4201_kofun_asuka.js',
    'hist_nara': '4202_nara_period.js',
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
    '4109_hokkaido_region_with_sources': '4109_hokkaido_region_with_sources.js',
    '4110_tohoku_region_with_sources': '4110_tohoku_region_with_sources.js',
    '4111_kanto_region_with_sources': '4111_kanto_region_with_sources.js',
    '4112_chubu_region_with_sources': '4112_chubu_region_with_sources.js',
    '4113_kinki_region_with_sources': '4113_kinki_region_with_sources.js',
    '4114_chugoku_shikoku_region_with_sources': '4114_chugoku_shikoku_region_with_sources.js',
    '4115_kyushu_region_with_sources': '4115_kyushu_region_with_sources.js',
    '4116_world_geography': '4116_world_geography.js'
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