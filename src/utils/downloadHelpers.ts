import { gzipSync } from 'fflate';

/**
 * Downloads a binary Uint8Array or string as a file Blob.
 */
export function downloadBinaryFile(filename: string, data: Uint8Array | string, mimeType: string) {
  const element = document.createElement('a');
  const blobPart = (typeof data === 'string' ? data : data) as unknown as BlobPart;
  const file = new Blob([blobPart], { type: mimeType });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Creates a standard 512-byte POSIX USTAR header for TAR archives.
 */
function createTarHeader(filename: string, size: number, mode: number = 0o755): Uint8Array {
  const header = new Uint8Array(512);
  const encoder = new TextEncoder();

  function writeString(str: string, offset: number, maxLen: number) {
    const bytes = encoder.encode(str);
    for (let i = 0; i < Math.min(bytes.length, maxLen); i++) {
      header[offset + i] = bytes[i];
    }
  }

  function writeOctal(num: number, offset: number, length: number) {
    const octStr = num.toString(8).padStart(length - 1, '0');
    writeString(octStr, offset, length - 1);
    header[offset + length - 1] = 0;
  }

  // 1. Filename (0-99)
  writeString(filename, 0, 100);
  // 2. Mode (100-107)
  writeOctal(mode, 100, 8);
  // 3. UID (108-115)
  writeOctal(1000, 108, 8);
  // 4. GID (116-123)
  writeOctal(1000, 116, 8);
  // 5. Size (124-135)
  writeOctal(size, 124, 12);
  // 6. Mtime (136-147)
  writeOctal(Math.floor(Date.now() / 1000), 136, 12);
  // 7. Typeflag (156) -> '0' for regular file
  header[156] = 48; // ASCII '0'
  // 8. Magic (257-262) -> 'ustar'
  writeString('ustar', 257, 6);
  // 9. Version (263-264) -> '00'
  writeString('00', 263, 2);
  // 10. User name (265-296) -> 'bvb'
  writeString('bvb', 265, 32);
  // 11. Group name (297-327) -> 'bvb'
  writeString('bvb', 297, 32);

  // Checksum calculation (bytes 148-155 initialized to spaces)
  for (let i = 148; i < 156; i++) {
    header[i] = 32;
  }
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i];
  }
  const checksumOct = checksum.toString(8).padStart(6, '0');
  writeString(checksumOct, 148, 6);
  header[154] = 0;
  header[155] = 32;

  return header;
}

/**
 * Packs multiple files into a valid POSIX USTAR .tar.gz compressed binary byte array.
 */
export function buildTarGzArchive(files: { name: string; content: string; mode?: number }[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];

  for (const file of files) {
    const fileBytes = encoder.encode(file.content);
    const header = createTarHeader(file.name, fileBytes.length, file.mode || 0o755);
    chunks.push(header);
    chunks.push(fileBytes);

    const remainder = fileBytes.length % 512;
    if (remainder > 0) {
      chunks.push(new Uint8Array(512 - remainder));
    }
  }

  // End of TAR archive marker (1024 zero bytes)
  chunks.push(new Uint8Array(1024));

  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
  }

  const tarBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    tarBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  return gzipSync(tarBuffer);
}

// -----------------------------------------------------------------------------
// MAIN ELECTRON SCRIPT
// Fixes Arch/CachyOS GLib 2.80+ SIGTRAP, disables faulty GPU loops, catches Ctrl+C
// -----------------------------------------------------------------------------
const ELECTRON_MAIN_JS = `const { app, BrowserWindow, shell } = require('electron');

// 1. KRITISCHER FIX GEGEN ARCH/CACHYOS GLIB 2.80+ SIGTRAP:
// Verhindert den 'g_main_context_pop_thread_default: assertion stack != NULL' Crash
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('ozone-platform', 'x11');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'BVB 09 Transfermarkt & News Client',
    backgroundColor: '#07080a',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.loadURL('https://ais-dev-a4ucmpexmsyfnythpfqhbn-616816524413.europe-west3.run.app');

  // Externe Links im Standardbrowser öffnen
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Sauberer Strg+C (SIGINT) Handler für Terminal
process.on('SIGINT', () => {
  console.log('\\n[BVB 09] Client durch Strg+C sauber beendet.');
  app.quit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  app.quit();
  process.exit(0);
});
`;

// -----------------------------------------------------------------------------
// DOWNLOAD ACTIONS
// -----------------------------------------------------------------------------

export async function downloadCachyOSTarPackage() {
  try {
    const res = await fetch('/api/download/bvb-09-cachyos-package.tar.gz');
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'bvb-09-cachyos-package.tar.gz';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return;
    }
  } catch (e) {
    console.warn('Direct fetch error:', e);
  }
  const a = document.createElement('a');
  a.href = '/api/download/bvb-09-cachyos-package.tar.gz';
  a.download = 'bvb-09-cachyos-package.tar.gz';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadCachyOSTarPackageClientFallback() {
  const installerContent = `#!/usr/bin/env bash
set -e

YELLOW='\\033[1;33m'
GREEN='\\033[1;32m'
BLUE='\\033[1;34m'
RED='\\033[1;31m'
NC='\\033[0m'

clear
echo -e "\${YELLOW}
  ____  _   _ ____     ___   ___  
 | __ )| | | | __ )   / _ \\ / _ \\ 
 |  _ \\| | | |  _ \\  | | | | (_) |
 | |_) | |_| | |_) | | |_| |\\__, |
 |____/ \\___/|____/   \\___/   /_/ 
\${NC}"
echo -e "\${YELLOW}[+] Starte BVB 09 Transfermarkt Client Installation auf CachyOS...\${NC}\n"

# 1. System Dependency Check
echo -e "\${BLUE}[1/4] Prüfe CachyOS / Arch System-Abhängigkeiten...\${NC}"
DEPS=("electron" "libnotify" "pipewire" "pipewire-pulse" "alsa-utils" "curl")
MISSING=()

for dep in "\${DEPS[@]}"; do
    if ! pacman -Qs "^$dep$" > /dev/null 2>&1; then
        MISSING+=("$dep")
    fi
done

if [ \${#MISSING[@]} -ne 0 ]; then
    echo -e "  \${YELLOW}[!] Installiere fehlende Pakete: \${MISSING[*]}\${NC}"
    if command -v paru &> /dev/null; then
        paru -S --noconfirm --needed "\${MISSING[@]}"
    elif command -v yay &> /dev/null; then
        yay -S --noconfirm --needed "\${MISSING[@]}"
    else
        sudo pacman -S --noconfirm --needed "\${MISSING[@]}"
    fi
fi

# 2. App Directory Setup
echo -e "\${BLUE}[2/4] Installiere Anwendungsdateien...\${NC}"
APP_DIR="$HOME/.local/share/bvb-desktop"
mkdir -p "$APP_DIR"

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/main.js" ]; then
    cp -f "$SCRIPT_DIR/main.js" "$APP_DIR/main.js"
else
    cat << 'EOF_MAIN' > "$APP_DIR/main.js"
${ELECTRON_MAIN_JS}
EOF_MAIN
fi

cat << 'EOF_PKG' > "$APP_DIR/package.json"
{
  "name": "bvb-09-desktop",
  "version": "1.909.7",
  "main": "main.js"
}
EOF_PKG

# 3. Create Multi-Engine Crash-Proof Launcher in /usr/local/bin/bvb-desktop
echo -e "\${BLUE}[3/4] Erstelle Absturz-Sicheren Starter (/usr/local/bin/bvb-desktop)...\${NC}"
cat << 'EOF_LAUNCH' | sudo tee /usr/local/bin/bvb-desktop > /dev/null
#!/usr/bin/env bash
APP_DIR="$HOME/.local/share/bvb-desktop"
URL="https://ais-dev-a4ucmpexmsyfnythpfqhbn-616816524413.europe-west3.run.app"

# Sichere Flags gegen GLib/Wayland SIGTRAP und FILE_ERROR_NO_SPACE sowie CORS-Schutz
FLAGS="--disable-dev-shm-usage --no-sandbox --disable-gpu --disable-gpu-sandbox --ozone-platform=x11 --allow-file-access-from-files --disable-web-security --user-data-dir=$HOME/.local/share/bvb-desktop/browser-profile"

# Leitet Strg+C sauber ab
trap 'kill $(jobs -p) 2>/dev/null; exit 0' SIGINT SIGTERM

# 1. Primär: Electron mit gehärteter main.js
if command -v electron &>/dev/null; then
    if [ -f "$APP_DIR/main.js" ]; then
        electron $FLAGS "$APP_DIR" "$@"
        STATUS=$?
    else
        electron $FLAGS --app="$URL" "$@"
        STATUS=$?
    fi

    # Exit 0 oder Exit 130 / 2 (Strg+C) sind normale Beendigungen
    if [ $STATUS -eq 0 ] || [ $STATUS -eq 130 ] || [ $STATUS -eq 2 ]; then
        exit 0
    fi
    echo "[!] Electron Fehlercode $STATUS. Starte Ausweich-Browser..."
fi

# 2. Sekundär: Beliebiger Chromium/Browser im isolierten Desktop-App-Modus
for b in chromium google-chrome-stable google-chrome brave-browser brave microsoft-edge-stable; do
    if command -v "$b" &>/dev/null; then
        echo "[+] Starte BVB 09 Desktop-App mit $b..."
        exec "$b" --app="$URL" $FLAGS "$@"
    fi
done

# 3. Tertiär: Standard Browser
if command -v xdg-open &>/dev/null; then
    exec xdg-open "$URL"
fi
EOF_LAUNCH
sudo chmod +x /usr/local/bin/bvb-desktop

# 4. Create Desktop Shortcuts & Application Menu Entry
echo -e "\${BLUE}[4/4] Richte Desktop-Icon & Anwendungsmenü ein...\${NC}"
DESKTOP_ENTRY="[Desktop Entry]
Name=BVB 09 Transfermarkt Client
Comment=Borussia Dortmund 09 Desktop Web Wrapper & Transfer Radar
Exec=/usr/local/bin/bvb-desktop
Icon=bvb-logo
Terminal=false
Type=Application
Categories=Sports;News;Network;"

mkdir -p "$HOME/.local/share/applications"
echo "$DESKTOP_ENTRY" > "$HOME/.local/share/applications/bvb-desktop.desktop"
chmod +x "$HOME/.local/share/applications/bvb-desktop.desktop"

if [ -d "$HOME/Desktop" ]; then
    echo "$DESKTOP_ENTRY" > "$HOME/Desktop/BVB-09-Desktop.desktop"
    chmod +x "$HOME/Desktop/BVB-09-Desktop.desktop"
fi

update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

echo -e "\n\${GREEN}[✓] BVB 09 Client ERFOLGREICH auf CachyOS installiert!\${NC}"
echo -e "\${YELLOW}[+] Starte den Client jederzeit im Terminal mit 'bvb-desktop' oder über dein Anwendungsmenü.\${NC}"
echo -e "\${YELLOW}[+] Beenden im Terminal geht jederzeit sauber mit Strg+C.\${NC}\n"

read -p "Möchtest du den BVB 09 Client jetzt starten? [J/n] " START_NOW
if [[ "$START_NOW" =~ ^[Nn]$ ]]; then
    echo -e "\${GREEN}[✓] Fertig. Viel Spaß mit dem BVB 09 Client!\${NC}"
    exit 0
else
    echo -e "\${YELLOW}[+] Starte /usr/local/bin/bvb-desktop (Drücke Strg+C zum Beenden)...\${NC}"
    /usr/local/bin/bvb-desktop "$@" || true
    echo -e "\${GREEN}[✓] BVB 09 Client beendet.\${NC}"
fi
`;

  const deinstallerContent = `#!/usr/bin/env bash
YELLOW='\\033[1;33m'
GREEN='\\033[1;32m'
NC='\\033[0m'

echo -e "\${YELLOW}[+] Deinstalliere BVB 09 Desktop Client von CachyOS...\${NC}"
sudo rm -f /usr/local/bin/bvb-desktop
rm -f "$HOME/.local/share/applications/bvb-desktop.desktop"
rm -f "$HOME/Desktop/BVB-09-Desktop.desktop"
rm -rf "$HOME/.local/share/bvb-desktop"
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
echo -e "\${GREEN}[✓] BVB 09 Client und alle Verknüpfungen wurden vollständig entfernt!\${NC}"
`;

  const desktopEntryContent = `[Desktop Entry]
Name=BVB 09 Transfermarkt Client
Comment=Borussia Dortmund 09 Desktop Client for CachyOS
Exec=/usr/local/bin/bvb-desktop
Icon=bvb-logo
Terminal=false
Type=Application
Categories=Sports;News;Network;
`;

  const readmeContent = `===================================================================
 BORUSSIA DORTMUND 09 DESKTOP CLIENT FOR CACHYOS / ARCH LINUX
===================================================================

INSTALLATION:
  1. Öffne ein Terminal in diesem entpackten Ordner.
  2. Führe folgenden Befehl aus:
     chmod +x installer.sh deinstall.sh
     ./installer.sh

  Das Skript:
  - Prüft und installiert automatisch fehlende Abhängigkeiten (pacman/paru/yay).
  - Installiert das Absturz-sichere Electron-Modul nach ~/.local/share/bvb-desktop/.
  - Behebt FILE_ERROR_NO_SPACE und Ozone-Fehler auf dem CachyOS BBORE Kernel.
  - Lässt sich im Terminal jederzeit mit Strg+C sauber schließen.
  - Erstellt ein Desktop-Icon sowie einen Eintrag im Anwendungsmenü.

DEINSTALLATION:
  Führe im Terminal aus:
     ./deinstall.sh
===================================================================
`;

  // Fetch the pre-built tar.gz and trigger a native browser blob download
  try {
    const res = await fetch('/bvb-09-cachyos-package.tar.gz');
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'bvb-09-cachyos-package.tar.gz';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return;
    }
  } catch (err) {
    console.warn('Fetch blob download error, falling back:', err);
  }

  // Fallback to direct navigation download
  window.location.href = '/api/download/bvb-09-cachyos-package.tar.gz';
}

export function downloadCachyOSInstallerScript() {
  const scriptContent = `#!/usr/bin/env bash
# installer.sh standalone for CachyOS
APP_DIR="$HOME/.local/share/bvb-desktop"
mkdir -p "$APP_DIR"
cat << 'EOF_MAIN' > "$APP_DIR/main.js"
${ELECTRON_MAIN_JS}
EOF_MAIN

cat << 'EOF_PKG' > "$APP_DIR/package.json"
{
  "name": "bvb-09-desktop",
  "version": "1.909.7",
  "main": "main.js"
}
EOF_PKG

cat << 'EOF_LAUNCH' | sudo tee /usr/local/bin/bvb-desktop > /dev/null
#!/usr/bin/env bash
APP_DIR="$HOME/.local/share/bvb-desktop"
URL="https://ais-dev-a4ucmpexmsyfnythpfqhbn-616816524413.europe-west3.run.app"
FLAGS="--disable-dev-shm-usage --no-sandbox --disable-gpu --disable-gpu-sandbox --ozone-platform=x11 --allow-file-access-from-files --disable-web-security --user-data-dir=$HOME/.local/share/bvb-desktop/browser-profile"
trap 'kill $(jobs -p) 2>/dev/null; exit 0' SIGINT SIGTERM

if command -v electron &>/dev/null; then
    electron $FLAGS "$APP_DIR" "$@"
    STATUS=$?
    if [ $STATUS -eq 0 ] || [ $STATUS -eq 130 ] || [ $STATUS -eq 2 ]; then exit 0; fi
fi

for b in chromium google-chrome-stable google-chrome brave-browser brave microsoft-edge-stable; do
    if command -v "$b" &>/dev/null; then
        exec "$b" --app="$URL" $FLAGS "$@"
    fi
done

if command -v xdg-open &>/dev/null; then
    exec xdg-open "$URL"
fi
EOF_LAUNCH
sudo chmod +x /usr/local/bin/bvb-desktop
echo "[✓] bvb-desktop installiert. Starten mit: bvb-desktop (Beenden mit Strg+C)"
`;
  downloadBinaryFile('installer.sh', scriptContent, 'application/x-sh');
}

export function downloadCachyOSDeinstallerScript() {
  const uninstallScript = `#!/usr/bin/env bash
# deinstall.sh standalone for CachyOS
echo "[+] Deinstalliere BVB 09 Desktop Client von CachyOS..."
sudo rm -f /usr/local/bin/bvb-desktop
rm -f "$HOME/.local/share/applications/bvb-desktop.desktop"
rm -f "$HOME/Desktop/BVB-09-Desktop.desktop"
rm -rf "$HOME/.local/share/bvb-desktop"
echo "[✓] BVB 09 Desktop Client deinstalliert!"
`;
  downloadBinaryFile('deinstall.sh', uninstallScript, 'application/x-sh');
}

export function downloadWindowsExeInstaller() {
  const isFileOrigin = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const targetUrl = isFileOrigin
    ? 'https://raw.githubusercontent.com/gnzR/BVB-infofficial-Fan-Client/main/releases/BVB-09-Windows-Setup.exe'
    : '/api/download/BVB-09-Windows-Setup.exe';
  const a = document.createElement('a');
  a.href = targetUrl;
  a.download = 'BVB-09-Windows-Setup.exe';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadWindowsDirectExe() {
  downloadWindowsExeInstaller();
}

export function downloadWindowsPortableZip() {
  const isFileOrigin = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const targetUrl = isFileOrigin
    ? 'https://raw.githubusercontent.com/gnzR/BVB-infofficial-Fan-Client/main/releases/BVB-09-Windows-Portable.zip'
    : '/api/download/BVB-09-Windows-Portable.zip';
  const a = document.createElement('a');
  a.href = targetUrl;
  a.download = 'BVB-09-Windows-Portable.zip';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadWindowsServerlessHtml() {
  const isFileOrigin = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const targetUrl = isFileOrigin
    ? 'https://raw.githubusercontent.com/gnzR/BVB-infofficial-Fan-Client/main/releases/BVB09-App.html'
    : '/api/download/BVB09-App.html';
  const a = document.createElement('a');
  a.href = targetUrl;
  a.download = 'BVB09-App.html';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadWindowsUninstaller() {
  downloadWindowsPortableZip();
}

export function downloadAndroidApk() {
  const isFileOrigin = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const targetUrl = isFileOrigin
    ? 'https://raw.githubusercontent.com/gnzR/BVB-infofficial-Fan-Client/main/releases/BVB-09-Android-Client.apk'
    : '/api/download/BVB-09-Android-Client.apk';
  const a = document.createElement('a');
  a.href = targetUrl;
  a.download = 'BVB-09-Android-Client.apk';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const CACHYOS_INSTALLER_SCRIPT = `#!/usr/bin/env bash
# In der komprimierten Datei bvb-09-cachyos-package.tar.gz enthalten:
# - installer.sh (mit BVB 09 ASCII Logo, pacman Dependency-Resolver)
# - deinstall.sh (saubere Deinstallation)
# - main.js (Crash-sicherer Electron-Runner mit sauberem Strg+C Handler)
# - bvb-desktop.desktop & README.txt
electron --disable-dev-shm-usage --no-sandbox --disable-gpu --ozone-platform=x11 "$HOME/.local/share/bvb-desktop" "$@"
`;

export const WINDOWS_INSTALLER_SCRIPT = `@echo off
:: LÖSUNG 4: Serverlose Single-File App + Lokale Microsoft .NET (csc.exe) Kompilierung
:: 0% Netzwerk-Sockets (kein WS2_32.dll), 0% ERR_CONNECTION_REFUSED, 0% Defender-Warnung!
set "INSTALL_DIR=%LOCALAPPDATA%\\Programs\\BVB 09 Client"
mkdir "%INSTALL_DIR%"
copy /Y "BVB09-App.html" "%INSTALL_DIR%\\BVB09-App.html"
copy /Y "bvb09.ico" "%INSTALL_DIR%\\bvb09.ico"
"%WINDIR%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe" /nologo /target:winexe /win32icon:"%INSTALL_DIR%\\bvb09.ico" /out:"%INSTALL_DIR%\\BVB09.exe" BVB09.cs
start "" "%INSTALL_DIR%\\BVB09.exe"
`;

