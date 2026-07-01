import json
import os

products_path = '/Users/jay_mac/shopping/shopping-mall/src/data/products.json'

with open(products_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    if p['id'] == 'F001':
        p['subcategory'] = '남성의류'
        p['image'] = '/images/products/blazer.png'
    elif p['id'] == 'F002':
        p['subcategory'] = '여성의류'
        p['image'] = '/images/products/knit.png'
    elif p['id'] == 'F003':
        p['subcategory'] = '남성의류'
        p['image'] = '/images/products/pants.png'
    elif p['id'] == 'E001':
        p['subcategory'] = '컴퓨터/디지털'
        p['image'] = '/images/products/headphones.png'
    elif p['id'] == 'E002':
        p['subcategory'] = '생활가전'
        p['image'] = '/images/products/air_purifier.png'
    elif p['id'] == 'E003':
        p['subcategory'] = 'TV/영상가전'
        p['image'] = '/images/products/projector.png'
    elif p['id'] == 'H001':
        p['subcategory'] = '건강식품'
        p['image'] = '/images/products/honey.png'
    elif p['id'] == 'H002':
        p['subcategory'] = '건강식품'
        p['image'] = '/images/products/probiotics.png'
    elif p['id'] == 'B001':
        p['subcategory'] = '스킨케어'
        p['image'] = '/images/products/serum.png'
    elif p['id'] == 'B002':
        p['subcategory'] = '향수'
        p['image'] = '/images/products/perfume.png'
    elif p['id'] == 'B003':
        p['subcategory'] = '스킨케어'
        p['image'] = '/images/products/eye_cream.png'
    elif p['id'] == 'L001':
        p['subcategory'] = '인테리어'
        p['image'] = '/images/products/diffuser.png'
    elif p['id'] == 'L002':
        p['subcategory'] = '침구'
        p['image'] = '/images/products/bedding.png'
    elif p['id'] == 'S001':
        p['subcategory'] = '캠핑/아웃도어'
        p['image'] = '/images/products/backpack.png'
    elif p['id'] == 'S002':
        p['subcategory'] = '피트니스'
        p['image'] = '/images/products/yoga_mat.png'
    elif p['id'] == 'S003':
        p['subcategory'] = '피트니스'
        p['image'] = '/images/products/sports_earphones.png'
    
    p['images'] = [p['image']]

with open(products_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Products updated successfully!")
