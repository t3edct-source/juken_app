#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
今日追加した画像を200KB程度に圧縮するスクリプト（改善版）
PNGファイルもリサイズとJPEG変換で圧縮
"""

import os
from PIL import Image
import sys

# 対象フォルダ（今日追加した画像）
target_folders = [
    'lessons/sci/modular/images/physics/current_effect_heating',
    'lessons/sci/modular/images/physics/current_circuit_integrated',
    'lessons/sci/modular/images/chemistry/neutralization',
    'lessons/sci/modular/images/chemistry/solution_metal_reaction',
    'lessons/sci/modular/images/biology/human_body_digestion_respiration',
    'lessons/sci/modular/images/biology/environment_energy',
    'lessons/sci/modular/images/biology/human_birth',
    'lessons/sci/modular/images/biology/bones_muscles_senses',
    'lessons/sci/modular/images/biology/respiration_excretion',
    'lessons/sci/modular/images/biology/heart_blood_circulation',
]

TARGET_SIZE_KB = 200
TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024

def get_file_size_kb(filepath):
    """ファイルサイズをKBで取得"""
    return os.path.getsize(filepath) / 1024

def compress_image(filepath, target_size_bytes):
    """画像を圧縮して200KB程度にする"""
    try:
        # 元のファイルサイズ
        original_size = os.path.getsize(filepath)
        original_size_kb = original_size / 1024
        
        # 既に200KB以下の場合はスキップ
        if original_size <= target_size_bytes:
            return False, original_size_kb, original_size_kb
        
        # 画像を開く
        img = Image.open(filepath)
        original_format = img.format
        original_mode = img.mode
        
        # 元の形式を保持
        file_ext = os.path.splitext(filepath)[1].lower()
        is_jpg = file_ext in ['.jpg', '.jpeg']
        is_png = file_ext == '.png'
        
        # PNGの場合はJPEGに変換して圧縮
        if is_png:
            # 透明部分がある場合は白背景に変換
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode in ('RGBA', 'LA'):
                    background.paste(img, mask=img.split()[-1])
                else:
                    background.paste(img)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # JPEGとして保存するパスに変更
            new_filepath = os.path.splitext(filepath)[0] + '.jpg'
        else:
            new_filepath = filepath
        
        # リサイズも試す（必要に応じて）
        width, height = img.size
        original_width, original_height = width, height
        
        # 品質を調整しながら試行
        quality = 85
        max_quality = 95
        min_quality = 50
        
        best_size = original_size
        best_quality = quality
        best_width = width
        best_height = height
        
        # バイナリサーチで最適な品質とサイズを見つける
        scale_factors = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5]
        
        for scale in scale_factors:
            test_width = int(width * scale)
            test_height = int(height * scale)
            
            if test_width < 100 or test_height < 100:
                break
            
            # リサイズ
            test_img = img.resize((test_width, test_height), Image.Resampling.LANCZOS)
            
            # 品質を調整
            quality = 85
            max_quality = 95
            min_quality = 50
            
            while min_quality <= max_quality:
                quality = (min_quality + max_quality) // 2
                
                # 一時ファイルに保存してサイズを確認
                temp_path = new_filepath + '.tmp'
                test_img.save(temp_path, 'JPEG', quality=quality, optimize=True)
                temp_size = os.path.getsize(temp_path)
                
                if temp_size <= target_size_bytes:
                    # 目標サイズ以下になった
                    if temp_size < best_size:
                        best_size = temp_size
                        best_quality = quality
                        best_width = test_width
                        best_height = test_height
                    max_quality = quality - 1
                else:
                    # まだ大きい
                    min_quality = quality + 1
                
                # 一時ファイルを削除
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            # このスケールで目標サイズ以下になったら終了
            if best_size <= target_size_bytes:
                break
        
        # 最適な設定で保存
        if best_size < original_size:
            # リサイズが必要な場合
            if best_width != original_width or best_height != original_height:
                img = img.resize((best_width, best_height), Image.Resampling.LANCZOS)
            
            # JPEGとして保存
            img.save(new_filepath, 'JPEG', quality=best_quality, optimize=True)
            
            # 元のPNGファイルを削除
            if is_png and new_filepath != filepath:
                if os.path.exists(filepath):
                    os.remove(filepath)
            
            new_size = os.path.getsize(new_filepath)
            new_size_kb = new_size / 1024
            return True, original_size_kb, new_size_kb
        else:
            return False, original_size_kb, original_size_kb
            
    except Exception as e:
        print(f"  エラー: {e}")
        import traceback
        traceback.print_exc()
        return False, 0, 0

def process_folder(folder_path):
    """フォルダ内の画像を処理"""
    if not os.path.exists(folder_path):
        print(f"[警告] フォルダが見つかりません: {folder_path}")
        return
    
    print(f"\n[{folder_path}]")
    files = [f for f in os.listdir(folder_path) 
             if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print("  画像ファイルが見つかりません")
        return
    
    compressed_count = 0
    total_original = 0
    total_compressed = 0
    
    for filename in sorted(files):
        filepath = os.path.join(folder_path, filename)
        original_size_kb = get_file_size_kb(filepath)
        total_original += original_size_kb
        
        if original_size_kb > TARGET_SIZE_KB:
            print(f"  [圧縮] {filename}: {original_size_kb:.1f}KB -> ", end="", flush=True)
            success, orig_kb, new_kb = compress_image(filepath, TARGET_SIZE_BYTES)
            if success:
                compressed_count += 1
                total_compressed += new_kb
                reduction = ((orig_kb - new_kb) / orig_kb) * 100
                new_ext = '.jpg' if filename.lower().endswith('.png') else ''
                print(f"{new_kb:.1f}KB ({reduction:.1f}%削減{new_ext})")
            else:
                total_compressed += orig_kb
                print(f"圧縮できませんでした")
        else:
            total_compressed += original_size_kb
            print(f"  [OK] {filename}: {original_size_kb:.1f}KB (スキップ)")
    
    if compressed_count > 0:
        total_reduction = ((total_original - total_compressed) / total_original) * 100
        print(f"  合計: {compressed_count}ファイルを圧縮")
        print(f"  サイズ: {total_original:.1f}KB -> {total_compressed:.1f}KB ({total_reduction:.1f}%削減)")

def main():
    print("=" * 60)
    print("画像圧縮スクリプト（改善版）")
    print(f"目標サイズ: {TARGET_SIZE_KB}KB")
    print("PNGファイルはJPEGに変換して圧縮します")
    print("=" * 60)
    
    for folder in target_folders:
        process_folder(folder)
    
    print("\n" + "=" * 60)
    print("完了しました！")
    print("=" * 60)
    print("\n注意: PNGファイルはJPEGに変換されました。")
    print("レッスンファイル（.js）の画像パスを更新する必要がある場合があります。")

if __name__ == '__main__':
    main()

