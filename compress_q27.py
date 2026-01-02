from PIL import Image
import os

# Q27.pngをさらに圧縮
img_path = 'lessons/sci/modular/Q27.png'
max_size_kb = 100

if os.path.exists(img_path):
    img = Image.open(img_path)
    current_size = os.path.getsize(img_path) / 1024
    
    print(f'Q27.png: 現在のサイズ: {current_size:.2f} KB')
    
    # 少しスケールを下げて再保存
    scale = 0.95
    new_width = int(img.width * scale)
    new_height = int(img.height * scale)
    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    resized_img.save(img_path, 'PNG', optimize=True, compress_level=9)
    new_size = os.path.getsize(img_path) / 1024
    
    print(f'  圧縮後: {new_size:.2f} KB')
    
    if new_size > max_size_kb:
        # さらに圧縮
        scale = 0.9
        new_width = int(img.width * scale)
        new_height = int(img.height * scale)
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        resized_img.save(img_path, 'PNG', optimize=True, compress_level=9)
        final_size = os.path.getsize(img_path) / 1024
        print(f'  再圧縮後: {final_size:.2f} KB')
else:
    print('ファイルが見つかりません')

