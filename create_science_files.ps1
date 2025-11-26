# catalog.jsonから全レッスンIDを取得して空のテンプレートファイルを作成
$catalog = Get-Content "catalog.json" -Raw | ConvertFrom-Json

# 理科レッスンを抽出
$sciLessons = $catalog | Where-Object { $_.subject -eq "sci" }
$oboeruLessons = $catalog | Where-Object { $_.subject -eq "science_drill" }

Write-Host "📚 理科レッスン: $($sciLessons.Count)個 (わかる編)"
Write-Host "📝 覚える編レッスン: $($oboeruLessons.Count)個"

# IDからファイル名を生成する関数
function Get-FileName {
    param($lessonId)
    return $lessonId -replace "^sci\.", "" -replace "\.", "_"
}

# テンプレート
$oboeruTemplate = "window.questions = [`n  // 問題データをここに追加してください`n];"
$wakaruTemplate = "window.questions = [`n  // 問題データをここに追加してください`n];"

# ディレクトリ
$oboeruDir = "lessons\sci\modular\oboeru"
$wakaruDir = "lessons\sci\modular\wakaru"

# 覚える編の.jsファイルを作成
$oboeruCreated = 0
$oboeruSkipped = 0
foreach ($lesson in $oboeruLessons) {
    $fileName = "$(Get-FileName $lesson.id).js"
    $filePath = Join-Path $oboeruDir $fileName
    
    if (-not (Test-Path $filePath)) {
        $oboeruTemplate | Out-File -FilePath $filePath -Encoding UTF8
        $oboeruCreated++
    } else {
        $oboeruSkipped++
    }
}

# わかる編の.jsファイルを作成
$wakaruCreated = 0
$wakaruSkipped = 0
foreach ($lesson in $sciLessons) {
    $fileName = "$(Get-FileName $lesson.id).js"
    $filePath = Join-Path $wakaruDir $fileName
    
    if (-not (Test-Path $filePath)) {
        $wakaruTemplate | Out-File -FilePath $filePath -Encoding UTF8
        $wakaruCreated++
    } else {
        $wakaruSkipped++
    }
}

Write-Host "`n✅ 覚える編: $oboeruCreated 個作成, $oboeruSkipped 個スキップ"
Write-Host "✅ わかる編: $wakaruCreated 個作成, $wakaruSkipped 個スキップ"

Write-Host "`n🎉 全レッスンの基本構造作成完了！"

