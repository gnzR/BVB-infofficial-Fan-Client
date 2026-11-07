# 🐣 Idiotensichere Installations-Anleitung (Schritt für Schritt)
**Für den `BVB Inofficial Fan Client (Beta 1.9.0.9)`**

Keine Sorge: Du musst kein Programmierer sein, um das Programm zu nutzen. Hier sind die **3 einfachsten Wege**, erklärt ohne Fachchinesisch.

---

## ⚠️ Schritt 0: Wie lädt man auf GitHub überhaupt eine Datei herunter?

Viele klicken auf GitHub auf einen Dateinamen und wundern sich, warum nichts heruntergeladen wird:
1. Klicke im Ordner **[`/releases`](./releases)** auf die Datei, die du haben möchtest.
2. Auf der nächsten Seite siehst du in der Mitte einen grauen Kasten mit dem Button **„View raw“** (oder oben rechts ein kleines Symbol mit einem **Pfeil nach unten 📥 „Download raw file“**).
3. **Klicke genau darauf** – erst dann startet der Download und die Datei landet in deinem `Downloads`-Ordner!

---

## 🥇 Methode 1: Die „5-Sekunden-Sofort-Methode“ (Für JEDEN PC – ohne Installation!)

Egal ob du **Windows**, **Linux** oder einen **Mac** hast – das hier klappt immer und sofort:

1. Lade die Datei **[`releases/BVB09-App.html`](./releases/BVB09-App.html)** herunter *(oben rechts auf das Download-Symbol 📥 mit dem Pfeil nach unten klicken)*.
2. Öffne deinen `Downloads`-Ordner.
3. Mache einen **Doppelklick auf `BVB09-App.html`**.
4. **Das war's schon!** Das komplette BVB-Programm startet sofort. Du kannst dir die Datei einfach auf deinen Desktop ziehen und jederzeit per Doppelklick öffnen.

---

## 🪟 Methode 2: Windows 10 & Windows 11 (Mit echtem BVB-Symbol auf dem Desktop)

### Option A: Über die ZIP-Datei (Empfohlen – ohne Windows-Warnmeldungen!)
1. Lade dir **[`releases/BVB-09-Windows-Portable.zip`](./releases/BVB-09-Windows-Portable.zip)** herunter.
2. Gehe in deinen `Downloads`-Ordner, mache einen **Rechtsklick** auf die Datei `BVB-09-Windows-Portable.zip` und klicke auf **„Alle extrahieren...“** -> **„Extrahieren“**.
3. Im neuen Fenster siehst du nun die entpackten Dateien:
   - Mache einen Doppelklick auf **`Installation-Starten.cmd`**, um das Programm fest einzurichten und automatisch ein **BVB-Icon auf deinen Desktop** zu legen.
   - Oder klicke direkt doppelt auf **`BVB09.exe`**, um sofort loszulegen.

### Option B: Über das Setup-Programm (`BVB-09-Windows-Setup.exe`)
1. Lade dir **[`releases/BVB-09-Windows-Setup.exe`](./releases/BVB-09-Windows-Setup.exe)** herunter und mache einen **Doppelklick** darauf.
2. **Falls Windows ein blaues Fenster („Der PC wurde durch Windows geschützt“) anzeigt:**
   - *Warum passiert das?* Weil Microsoft für digitale Entwickler-Unterschriften mehrere hundert Euro pro Jahr verlangt und dies ein 100 % kostenloses Fanprojekt ist.
   - Klicke im blauen Fenster einfach links auf den unterstrichenen Text **„Weitere Informationen“**.
   - Klicke danach unten rechts auf den Button **„Trotzdem ausführen“**.
3. Klicke im schwarz-gelben BVB-Fenster auf **„Installieren“** – fertig!

---

## 🐧 Methode 3: CachyOS / Arch Linux / Linux-Desktop

1. Lade dir **[`releases/bvb-09-cachyos-package.tar.gz`](./releases/bvb-09-cachyos-package.tar.gz)** in deinen `Downloads`-Ordner herunter.
2. Öffne dein **Terminal** (Konsole), kopiere den folgenden Befehl komplett hinein (`Strg+Shift+V`) und drücke **Enter**:
   ```bash
   cd ~/Downloads && tar -xzf bvb-09-cachyos-package.tar.gz && chmod +x installer.sh && ./installer.sh
   ```
3. **Fertig!** Das Programm richtet sich automatisch ein und legt ein BVB-Symbol in dein Startmenü sowie auf deinen Desktop.
4. **Wieder löschen?** Einfach im selben Ordner `./deinstall.sh` im Terminal ausführen.

---

**Viel Spaß mit dem BVB Inofficial Fan Client! Heja BVB! 🖤💛**
