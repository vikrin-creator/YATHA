# Product Images

## Current Images

All products currently use: `/uploads/images/placeholder.png`

## Adding Real Product Images

To add real product images:

1. Place your product images in this folder
2. Use these filenames:
   - `moringa-powder.jpg` or `moringa-powder.png`
   - `beetroot-powder.jpg` or `beetroot-powder.png`
   - `abc-powder.jpg` or `abc-powder.png`
   - `turmeric-powder.jpg` or `turmeric-powder.png`

3. Update the database:
```sql
UPDATE products SET image = '/uploads/images/moringa-powder.jpg' WHERE slug = 'moringa-powder';
UPDATE products SET image = '/uploads/images/beetroot-powder.jpg' WHERE slug = 'beetroot-powder';
UPDATE products SET image = '/uploads/images/abc-powder.jpg' WHERE slug = 'abc-powder';
UPDATE products SET image = '/uploads/images/turmeric-powder.jpg' WHERE slug = 'turmeric-powder';
```

## Image Requirements

- Format: JPG or PNG
- Recommended size: 800x800px
- Max file size: 2MB
- Aspect ratio: Square (1:1) preferred

## Access URL

Images are accessible at: `http://localhost:8000/uploads/images/filename.jpg`
