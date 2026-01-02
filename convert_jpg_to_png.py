from PIL import Image
import os

# 変換対象のJPEGファイル
sci_dir = 'lessons/sci/modular'
jpg_files = [
    'futto.jpg',
    'gyoketsu.jpg',
    'johatsu.jpg',
    'kazetojohatsu.jpg',
    'Q3.jpg',
    'Q4.jpg',
    'Q5.jpg',
    'Q26.jpg',
    'Q27.jpg',
    'Q28.jpg',
    'Q29.jpg',
    'Q30.jpg',
    'yuge.jpg',
    'yukai.jpg'
]

max_size_kb = 100

for jpg_file in jpg_files:
    jpg_path = os.path.join(sci_dir, jpg_file)
    png_path = os.path.join(sci_dir, jpg_file.replace('.jpg', '.png'))
    
    if not os.path.exists(jpg_path):
        print(f'ファイルが見つかりません: {jpg_file}')
        continue
    
    try:
        # JPEG画像を開く
        img = Image.open(jpg_path)
        original_size = os.path.getsize(jpg_path) / 1024
        
        print(f'\n{jpg_file}:')
        print(f'  元のサイズ: {original_size:.2f} KB')
        
        # PNG形式で保存を試みる
        # PNGは圧縮率が低いので、必要に応じてリサイズする
        scale = 1.0
        quality_level = 9  # PNGの圧縮レベル（0-9、9が最高圧縮）
        
        while True:
            # スケールを適用
            if scale < 1.0:
                new_width = int(img.width * scale)
                new_height = int(img.height * scale)
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            else:
                resized_img = img.copy()
            
            # PNG形式で保存
            resized_img.save(png_path, 'PNG', optimize=True, compress_level=quality_level)
            png_size = os.path.getsize(png_path) / 1024
            
            if png_size <= max_size_kb:
                print(f'  ✓ 変換完了: {png_size:.2f} KB (PNG, scale: {scale:.2f})')
                # 元のJPEGファイルを削除
                os.remove(jpg_path)
                break
            else:
                # まだ大きい場合はスケールを下げる
                if scale > 0.3:
                    scale -= 0.1
                else:
                    # さらにスケールを下げる
                    scale = max(0.2, scale - 0.05)
                    quality_level = min(9, quality_level + 1)
                
                if scale < 0.2:
                    print(f'  ✗ 変換に失敗: 目標サイズに到達できませんでした (現在: {png_size:.2f} KB)')
                    # それでもPNGとして保存
                    break
        
    except Exception as e:
        print(f'エラー ({jpg_file}): {e}')

print('\n変換完了！')

