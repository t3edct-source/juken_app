# タイプライター形式を削除するPowerShellスクリプト
# 40個の算数単元すべてのstyle.cssを修正

Write-Host "タイプライター形式の削除を開始します..." -ForegroundColor Green

# 対象ディレクトリ
$baseDir = "lessons/math/g5"

# 修正対象のファイルパターン
$cssFiles = Get-ChildItem -Path $baseDir -Recurse -Filter "style.css"

Write-Host "対象ファイル数: $($cssFiles.Count)" -ForegroundColor Yellow

$successCount = 0
$errorCount = 0

foreach ($file in $cssFiles) {
    try {
        Write-Host "処理中: $($file.Name)" -ForegroundColor Cyan
        
        # ファイルの内容を読み込み
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # タイプライター効果のCSSを削除
        $oldPattern = "/* タイプライター効果用のクラス */`n.typewriter {`n  overflow: hidden;`n  white-space: nowrap;`n  border-right: 2px solid transparent;`n  animation: typing 2s steps(40, end), blink-caret 0.75s step-end infinite;`n}`n`n@keyframes typing {`n  from { width: 0; }`n  to { width: 100%; }`n}`n`n@keyframes blink-caret {`n  from, to { border-color: transparent; }`n  50% { border-color: #333; }`n}"
        
        $newContent = "/* タイプライター効果は削除 - 分数表示を優先 */"
        
        # 置換実行
        if ($content -match [regex]::Escape($oldPattern)) {
            $content = $content -replace [regex]::Escape($oldPattern), $newContent
            Set-Content $file.FullName -Value $content -Encoding UTF8
            Write-Host "  ✅ 修正完了" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ⚠️  タイプライター効果が見つかりませんでした" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ エラー: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n処理完了!" -ForegroundColor Green
Write-Host "成功: $successCount ファイル" -ForegroundColor Green
Write-Host "エラー: $errorCount ファイル" -ForegroundColor Red

if ($errorCount -eq 0) {
    Write-Host "`n🎉 すべてのファイルの修正が完了しました！" -ForegroundColor Green
    Write-Host "これで、すべての算数単元でタイプライター効果が無効化され、分数表示が改善されます。" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  一部のファイルでエラーが発生しました。エラーの詳細を確認してください。" -ForegroundColor Yellow
}
