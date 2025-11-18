# Electron Application Setup Guide

Build and run Document Processor as a professional standalone Windows desktop application.

---

## 📋 Prerequisites

Before building the Electron app, ensure you have:

- ✅ **Node.js 18+** - https://nodejs.org/
- ✅ **npm 9+** - Comes with Node.js
- ✅ **MongoDB running** - Local or Docker
- ✅ **Windows (for .exe)** - Or cross-compile on other platforms

Check your versions:
```cmd
node --version
npm --version
```

---

## 🚀 Quick Start (5 Steps)

### **Step 1: Prepare Dependencies**

Navigate to document-processing folder:
```cmd
cd f:\Projects\DeskTop\n8n-custom-modules\document-processing
```

### **Step 2: Install Electron Dependencies**

```cmd
npm install electron electron-builder electron-is-dev concurrently wait-on --save-dev
```

### **Step 3: Run in Development Mode**

```cmd
npm run dev
```

This will:
1. Start the Express server
2. Wait for it to be ready
3. Launch Electron app
4. Open developer tools

### **Step 4: Test the App**

- Log in with: `test@example.com` / `test123456`
- Upload a test document
- Process it
- Verify results appear

### **Step 5: Build the Installer**

```cmd
npm run build:app:win
```

---

## 📦 What Gets Built

The build process creates:

| File | Type | Size | Purpose |
|------|------|------|---------|
| `DocumentProcessor-2.0.0.exe` | **NSIS Installer** | ~150MB | Full installer with setup wizard |
| `DocumentProcessor-2.0.0-portable.exe` | **Portable** | ~120MB | Single file, no installation needed |
| `DocumentProcessor-2.0.0-unpacked` | **Unpacked** | ~200MB | Dev/debug folder |

Located in: `dist/` folder

---

## 🎯 Installation Wizard Features

When users run the installer, they get:

✅ **Custom Setup Wizard**
- Choose installation directory
- Select start menu options
- Option to create desktop shortcut

✅ **Automatic Installation**
- Extracts files
- Creates shortcuts
- Registers in Windows

✅ **Easy Uninstallation**
- Add/Remove Programs integration
- Clean removal of all files

✅ **Auto-Updates Ready**
- Infrastructure for future updates
- Version checking

---

## 🔨 Build Commands

### **Development (Test in Electron)**
```cmd
npm run dev
```
Starts server + Electron with DevTools

### **Production Build (Windows Installer + Portable)**
```cmd
npm run build:app:win
```
Creates both NSIS installer and portable exe

### **Pack Only (No Build)**
```cmd
npm run pack
```
Creates unpacked directory (useful for testing)

### **Full Release (All Platforms)**
```cmd
npm run release
```
Build for Windows, macOS, Linux (requires each platform)

---

## 📋 File Structure

```
document-processing/
├── electron-main.js           ← Main Electron process
├── electron-preload.js        ← Security bridge
├── electron-builder.yml       ← Build configuration
├── assets/
│   └── icon.svg              ← App icon source
├── admin.js                  ← Express server
├── public/
│   ├── admin.html
│   └── document-processor.html
├── lib/                      ← Backend services
├── dist/                     ← Built installers (created after build)
└── package.json
```

---

## 🎨 App Features

### **Window**
- Width: 1400px, Height: 900px
- Minimum: 1000x600px
- Resizable and maximizable
- Professional title bar

### **Menu Bar**
- **File**: Exit
- **Edit**: Undo, Redo, Cut, Copy, Paste
- **View**: Reload, DevTools, Zoom, Fullscreen
- **Help**: Documentation, Admin Panel, Logs Folder

### **Features**
- Automatic server startup
- Integrated Express backend
- Secure context isolation
- Pre-configured for Windows

### **Auto-launch Server**
- Checks if port 3002 is available
- Starts Node.js Express server
- Waits up to 30 seconds for startup
- Handles crashes gracefully

---

## 🔧 Customization

### **Change App Icon**

1. Create 256x256 PNG icon
2. Save as: `assets/icon.png`
3. Rebuild:
```cmd
npm run build:app:win
```

To convert existing icon:
- Use online tool: https://icoconvert.com/
- Or use ImageMagick:
```cmd
magick convert assets/icon.png -define icon:auto-resize=256,128,96,64,48,32,16 assets/icon.ico
```

### **Change App Name**

Edit `electron-builder.yml`:
```yaml
appId: com.documentprocessor.app
productName: Your Custom Name
```

### **Change Window Size**

Edit `electron-main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1400,    ← Change here
  height: 900,    ← Change here
  minWidth: 1000,
  minHeight: 600
});
```

### **Change Installer Options**

Edit `electron-builder.yml` under `nsis:` section:
```yaml
nsis:
  oneClick: false                           ← Detailed setup wizard
  allowToChangeInstallationDirectory: true  ← User can choose folder
  createDesktopShortcut: true              ← Add desktop icon
  createStartMenuShortcut: true            ← Add start menu icon
```

---

## 📊 Performance

### **App Size**
- Installer: ~150MB
- Portable: ~120MB
- After installation: ~300MB (includes Node.js runtime)

### **Memory Usage**
- Idle: ~100-150MB
- Processing: ~200-300MB
- Multiple documents: Scales linearly

### **Startup Time**
- Cold start: 2-3 seconds
- Warm start: <1 second
- First run (npm install): 1-2 minutes

---

## 🔐 Security Features

### **Context Isolation**
- Renderer process cannot access Node APIs
- Safe IPC bridge via preload script

### **Secure Preload**
- Limited API exposure:
  - `openDocumentsFolder()`
  - `openExternalUrl(url)`
  - `getAppVersion()`
  - `getPlatform()`

### **No Remote Module**
- Prevents security vulnerabilities
- Disables `require()` in renderer

### **Content Security**
- HTTPS enforced (except localhost)
- No inline scripts
- Restricted permissions

---

## 🐛 Debugging

### **Enable DevTools**
In `electron-main.js`, set:
```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

### **View Server Logs**
1. Click **Help** → **Open Logs Folder**
2. Or navigate to: `document-processing/logs/`
3. View `app.log` file

### **Check Running Processes**
```cmd
netstat -ano | findstr :3002
tasklist | findstr node
tasklist | findstr electron
```

### **Kill Processes If Stuck**
```cmd
taskkill /F /IM node.exe
taskkill /F /IM electron.exe
```

---

## 📦 Distribution

### **Option 1: Share NSIS Installer**
```
DocumentProcessor-2.0.0.exe  (~150MB)
```
✅ Professional installer experience
✅ Setup wizard guides users
✅ Creates start menu entries
❌ Larger file size

### **Option 2: Share Portable Exe**
```
DocumentProcessor-2.0.0-portable.exe  (~120MB)
```
✅ Single file, no installation
✅ Can run from USB
✅ Works on restricted systems
❌ Less polished experience

### **Option 3: Host on GitHub Releases**
```bash
# Tag a release
git tag v2.0.0
git push origin v2.0.0

# GitHub Actions will auto-build and create release
```

---

## ✅ Build Checklist

Before distributing:

- [ ] Icon created and placed in `assets/`
- [ ] App name updated in `electron-builder.yml`
- [ ] Version updated in `package.json`
- [ ] Description updated in `electron-builder.yml`
- [ ] Tested in development mode (`npm run dev`)
- [ ] No console errors in DevTools
- [ ] Tested login functionality
- [ ] Tested document upload
- [ ] Tested storage to local folder
- [ ] Built successfully (`npm run build:app:win`)
- [ ] Installer created in `dist/`
- [ ] Tested installer on clean Windows system

---

## 🆘 Troubleshooting

### **Build Fails: "Cannot find icon"**
```
Error: Icon not found: assets/icon.ico
```

**Solution:**
```cmd
# Create icon from SVG
npm install -g imagemagick
convert assets/icon.svg assets/icon.ico
```

### **Electron Won't Start Server**
```
Server startup timeout
```

**Solution:**
1. Check MongoDB is running
2. Check port 3002 is free
3. Run manually:
```cmd
npm start
```
4. Then in another window:
```cmd
npm run start:electron
```

### **App Starts But Shows Blank Window**
```
ERR_CONNECTION_REFUSED
```

**Solution:**
1. Server didn't start
2. Check console output
3. Try waiting longer before clicking

### **Installation Fails on Some Systems**
```
Installation canceled by user or error occurred
```

**Solution:**
- Try portable version instead
- Check Windows admin privileges
- Verify sufficient disk space
- Run Windows Update

### **App Launches But Can't Login**
```
{"status": "error", "message": "Unauthorized"}
```

**Solution:**
1. Verify MongoDB is running
2. Check test user exists:
```cmd
# In document-processing folder
node setup.js
```
3. Check credentials in database

---

## 🎓 Next Steps After Building

1. **Test Installation**
   - Run the .exe installer
   - Go through setup wizard
   - Verify all features work

2. **Create Release Notes**
   - Version number
   - New features
   - Bug fixes
   - Installation instructions

3. **Distribute**
   - Upload to GitHub Releases
   - Share download link
   - Update documentation

4. **Gather Feedback**
   - Monitor for issues
   - Collect user feedback
   - Plan next release

---

## 📚 Related Documentation

- [Desktop Launcher Setup](./DESKTOP-LAUNCHER-SETUP.md)
- [Main Setup Guide](./DOCUMENT_PROCESSOR_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder Documentation](https://www.electron.build/)

---

## 🚀 Pro Tips

1. **Version Management**
   - Update version in `package.json` before each build
   - Use semantic versioning: MAJOR.MINOR.PATCH
   - Update version in `electron-builder.yml` if needed

2. **Faster Builds**
   - First build: Full (includes runtime)
   - Subsequent builds: Delta only (faster)
   - Dev mode: Use `npm run dev` for rapid testing

3. **Distribution Size**
   - Compress before uploading
   - Use 7-Zip: 150MB → 45MB
   - Upload to CDN for faster downloads

4. **Auto-Updates**
   - Electron-updater ready in config
   - Requires GitHub releases
   - Users auto-update on launch

---

## 📞 Support

For issues specific to:
- **Electron**: Check https://www.electronjs.org/docs
- **Build errors**: Run with `--debug` flag
- **Node/npm**: Visit https://nodejs.org/support
- **MongoDB**: Check https://docs.mongodb.com/

Good luck building! 🚀