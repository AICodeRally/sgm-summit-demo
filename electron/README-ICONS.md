# Electron Icon Files

To complete the Electron build, you need to add icon files in this directory:

## Required Icon Files:

### macOS:
- `icon.icns` - macOS icon file (512x512, 256x256, 128x128, 64x64, 32x32, 16x16)

**How to create:**
1. Create a 1024x1024 PNG image
2. Use `iconutil` to convert:
   \`\`\`bash
   mkdir icon.iconset
   sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
   sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
   sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
   sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
   sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
   sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
   sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
   sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
   sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
   sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
   iconutil -c icns icon.iconset
   \`\`\`

### Windows:
- `icon.ico` - Windows icon file (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)

**How to create:**
Use online converter: https://convertio.co/png-ico/
Or ImageMagick:
\`\`\`bash
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
\`\`\`

### Linux:
- `icon.png` - PNG icon file (512x512 recommended)

## Temporary Workaround:

Until you have proper icons, the build will use default Electron icons.
The app will still work, but won't have branded icons.

## Icon Design Tips:

- Keep design simple (recognizable at small sizes)
- Use high contrast
- Avoid fine details
- Test at 16x16 size
- Consider macOS rounded corners
- Use transparent background
