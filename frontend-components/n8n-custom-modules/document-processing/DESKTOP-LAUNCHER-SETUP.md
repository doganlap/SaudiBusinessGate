# Desktop Launcher Setup Guide

This guide will help you set up quick desktop access to the Document Processor application.

## 🚀 Quick Setup (2 Steps)

### **Step 1: Run the Setup Script**

Choose one method:

#### **Method A: PowerShell (Recommended)**
```powershell
# Right-click PowerShell and select "Run as Administrator"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
./create-shortcut.ps1
```

#### **Method B: Command Prompt**
```cmd
PowerShell -ExecutionPolicy RemoteSigned -File create-shortcut.ps1
```

#### **Method C: Batch File (Direct)**
```cmd
# Just double-click: create-shortcut.bat
```

### **Step 2: Check Your Desktop**

You should now see:
- ✅ **"Document Processor"** shortcut on your Desktop
- ✅ **"Document Processor"** in your Windows Start Menu

---

## 💻 Using the Desktop Shortcut

### **First Launch**
1. Double-click the **"Document Processor"** shortcut on your desktop
2. A console window will open showing:
   ```
   🚀 Starting Document Processor Server...
   📥 Installing dependencies (first time only)...
   ✅ Server is running!
   🌐 Opening Document Processor in browser...
   ```
3. Your browser will open automatically to the app

### **Running Later**
Simply double-click the Desktop shortcut anytime. The app will:
- ✅ Check if server is already running (auto-reuse if available)
- ✅ Install dependencies on first run only (subsequent launches are instant)
- ✅ Start the server
- ✅ Open your browser to the application

---

## 🎯 What Happens When You Click the Shortcut

```
Desktop Shortcut
       ↓
Launch Console (launch-app.bat)
       ↓
Check Node.js installed
       ↓
Check MongoDB running
       ↓
Install dependencies (first time only)
       ↓
Start Express Server (Port 3002)
       ↓
Open browser to:
http://localhost:3002/document-processor
       ↓
Console stays open to show logs
(Close console to stop server)
```

---

## 🔧 Troubleshooting

### **Problem: Node.js not found**
```
❌ ERROR: Node.js is not installed or not in PATH
```

**Solution:**
1. Install Node.js from: https://nodejs.org/
2. Choose "LTS" (Long Term Support) version
3. Select "Add to PATH" during installation
4. Restart your computer
5. Try again

### **Problem: MongoDB not running**
```
⚠️  WARNING: MongoDB might not be running on port 27017
```

**Solution:**
Choose one:

**Option A: Local MongoDB Service**
```cmd
# Windows Command Prompt (as Administrator)
mongod --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
```

**Option B: Docker (Recommended)**
```cmd
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### **Problem: Port 3002 already in use**
```
Address already in use :::3002
```

**Solution:**
- The server is likely already running from a previous launch
- Check if a console window is still open from the last run
- Or close it manually:
```cmd
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### **Problem: Dependencies installation fails**
```
❌ ERROR: Failed to install dependencies
```

**Solution:**
```cmd
# Open command prompt in the document-processing folder
npm install

# If that fails, try:
npm cache clean --force
npm install
```

### **Problem: Browser doesn't open automatically**
```
🌐 Opening Document Processor in browser...
# But browser doesn't open
```

**Solution:**
1. Check the console window - it should show: `http://localhost:3002/document-processor`
2. Copy that URL
3. Paste into your browser's address bar manually

---

## 📁 Files Involved

| File | Purpose |
|------|---------|
| `launch-app.bat` | Main launcher script that starts everything |
| `create-shortcut.ps1` | Creates desktop and start menu shortcuts |
| `create-shortcut.bat` | Batch wrapper for the PowerShell script |

---

## 🎨 Customizing the Shortcut

### **Change Shortcut Icon**
1. Right-click the shortcut → **Properties**
2. Click **Change Icon...**
3. Navigate to: `n8n-custom-modules\document-processing\assets\icon.ico`
4. Click OK

### **Run Minimized**
1. Right-click the shortcut → **Properties**
2. In the "Window" dropdown, select **Minimized**
3. Click OK
4. Now the console window will start minimized

### **Change Working Directory**
1. Right-click the shortcut → **Properties**
2. In "Start in" field, ensure it points to the document-processing folder
3. Should be: `f:\Projects\DeskTop\n8n-custom-modules\document-processing`

---

## ⌨️ Keyboard Shortcuts

While the application is running:

| Key | Action |
|-----|--------|
| `Ctrl+C` | Stop the server (in console window) |
| Close console | Stop the server |

---

## 🚀 Advanced Options

### **Auto-start on Windows Startup**
1. Press `Win + R`
2. Type: `shell:startup`
3. Drag your "Document Processor" shortcut into this folder
4. The app will auto-launch when you restart Windows

### **Run with Specific Node Version**
Edit `launch-app.bat` and replace `node` with full path:
```batch
"C:\Program Files\nodejs\node.exe" index.js
```

### **Run in Different Port**
Edit `launch-app.bat` and add before `npm start`:
```batch
set ADMIN_PORT=3003
```

---

## 📊 Performance Tips

1. **Faster Startup**: Keep MongoDB running in background
2. **Instant Relaunch**: Server stays running, just open shortcut again
3. **Check Status**: Look at console window to see server health
4. **Free Resources**: Close shortcut/console when done processing

---

## 📝 Log Files

Server logs are saved to:
```
f:\Projects\DeskTop\n8n-custom-modules\document-processing\app.log
```

View recent logs:
1. Open file in any text editor
2. Or: `type app.log` in command prompt
3. Or: `tail -f app.log` in PowerShell

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Shortcut appears on Desktop
- [ ] Shortcut appears in Start Menu
- [ ] Shortcut has a document icon
- [ ] Double-clicking opens console
- [ ] Console shows "✅ Server is running!"
- [ ] Browser opens automatically
- [ ] App loads successfully in browser
- [ ] Can login with test@example.com / test123456

---

## 🎓 Next Steps

Once the shortcut is set up:

1. **First Launch**: App will install dependencies (takes 1-2 minutes)
2. **Subsequent Launches**: Instant (just opens browser)
3. **Add Credentials**: Go to Admin Panel to set up services
4. **Process Documents**: Use Document Processor to upload files

---

## 🆘 Need Help?

If issues persist:

1. **Check logs**: `app.log` in document-processing folder
2. **Verify requirements**:
   - Node.js 18+ installed
   - MongoDB running
   - Port 3002 available
3. **Try manual startup**:
   ```cmd
   cd f:\Projects\DeskTop\n8n-custom-modules\document-processing
   npm install
   npm start
   ```

---

## 📚 Related Documentation

- [Main Setup Guide](./DOCUMENT_PROCESSOR_GUIDE.md)
- [Admin Panel Setup](./README.md)
- [Troubleshooting](./TROUBLESHOOTING.md)