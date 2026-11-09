# 🐣 Idiotensichere Installations-Anleitung (Schritt für Schritt)
**Für den `BVB Inofficial Fan Client (Beta 1.9.0.9)`**

Keine Sorge: Du musst kein Programmierer sein, um das Programm zu nutzen. Hier sind die **einfachen Wege für Windows 10/11 und CachyOS / Linux**, erklärt ohne Fachchinesisch.

---

## ⚠️ Schritt 0: Wie lädt man auf GitHub überhaupt eine Datei herunter?

Viele klicken auf GitHub auf einen Dateinamen und wundern sich, warum nichts heruntergeladen wird:
1. Klicke im Ordner **[`/releases`](./releases)** auf die Datei für dein Betriebssystem (z. B. `BVB-09-Windows-Portable.zip` für Windows oder `bvb-09-cachyos-package.tar.gz` für Linux).
2. Auf der nächsten Seite siehst du in der Mitte einen grauen Kasten mit dem Button **„View raw“** (oder oben rechts ein kleines Symbol mit einem **Pfeil nach unten 📥 „Download raw file“**).
3. **Klicke genau darauf** – erst dann startet der Download und die Datei landet in deinem `Downloads`-Ordner!

---

## 🪟 Methode 1: Windows 10 & Windows 11 (Mit echtem BVB-Symbol auf dem Desktop)

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

## 🐧 Methode 2: CachyOS / Arch Linux / Linux-Desktop

1. Lade dir **[`releases/bvb-09-cachyos-package.tar.gz`](./releases/bvb-09-cachyos-package.tar.gz)** in deinen `Downloads`-Ordner herunter.
2. Öffne dein **Terminal** (Konsole), kopiere den folgenden Befehl komplett hinein (`Strg+Shift+V`) und drücke **Enter**:
   ```bash
   cd ~/Downloads && tar -xzf bvb-09-cachyos-package.tar.gz && chmod +x installer.sh && ./installer.sh
   ```
3. **Fertig!** Das Programm richtet sich automatisch ein und legt ein BVB-Symbol in dein Startmenü sowie auf deinen Desktop.
4. **Wieder löschen?** Einfach im selben Ordner `./deinstall.sh` im Terminal ausführen.

---

## 📱 Methode 3: Android-Smartphones & Tablets (⚠️ Absolute Beta-Testversion!)

> **⚠️ Hinweis:** Die Android-App befindet sich aktuell in einer **frühen, experimentellen Testphase (Absolute Beta)**.

1. Tippe im Ordner **[`/releases`](./releases)** auf die Datei **[`BVB-09-Android-Client.apk`](./releases/BVB-09-Android-Client.apk)** und wähle **„View raw“** bzw. **„Download raw file“**.
2. Öffne die heruntergeladene Datei `BVB-09-Android-Client.apk` in deinem `Downloads`-Ordner auf dem Smartphone.
3. Falls Android nachfragt, erlaube einmalig **„Aus dieser Quelle zulassen / Unbekannte Apps installieren“** und tippe auf **„Installieren“**.
4. **Fertig!** Der **BVB Fan Client** erscheint nun mit dem offiziellen **BVB 09 Logo** auf deinem Startbildschirm.

---

**Viel Spaß mit dem BVB Inofficial Fan Client! Heja BVB! 🖤💛**

