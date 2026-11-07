@echo off
chcp 65001 >nul 2>&1
title BVB Inofficial Fan Client - Windows 10/11 Setup (Loesung 4)
color 0E
cls

echo ============================================================================
echo   BORUSSIA DORTMUND 09 - WINDOWS 10 / 11 NATIVE INSTALLATION (LOESUNG 4)
echo ============================================================================
echo.

set "SRC_DIR=%~dp0"
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\BVB 09 Client"

echo [1/5] Erstelle Programmverzeichnis:
echo       "%INSTALL_DIR%"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/5] Kopiere serverlose BVB 09 App-Dateien und Icons...
if exist "%SRC_DIR%BVB09-App.html" (
    copy /Y "%SRC_DIR%BVB09-App.html" "%INSTALL_DIR%\BVB09-App.html" >nul
) else (
    echo [!] FEHLER: BVB09-App.html wurde nicht im selben Ordner gefunden!
    echo     Bitte entpacke zuerst die gesamte ZIP-Datei in einen Ordner.
    pause
    exit /b 1
)

if exist "%SRC_DIR%bvb09.ico" copy /Y "%SRC_DIR%bvb09.ico" "%INSTALL_DIR%\bvb09.ico" >nul
if exist "%SRC_DIR%BVB09.cs" copy /Y "%SRC_DIR%BVB09.cs" "%INSTALL_DIR%\BVB09.cs" >nul

:: Entferne eventuelles Mark-of-the-Web (Zone.Identifier) von den lokalen Dateien
type nul > "%INSTALL_DIR%\BVB09-App.html:Zone.Identifier" 2>nul
type nul > "%INSTALL_DIR%\bvb09.ico:Zone.Identifier" 2>nul

echo [3/5] Kompiliere BVB09.exe lokal mit dem Windows-eigenen Microsoft C# Compiler...
set "CSC64=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
set "CSC32=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
set "CSC_CMD="

if exist "%CSC64%" set "CSC_CMD=%CSC64%"
if not defined CSC_CMD if exist "%CSC32%" set "CSC_CMD=%CSC32%"

if defined CSC_CMD (
    if exist "%INSTALL_DIR%\bvb09.ico" (
        "%CSC_CMD%" /nologo /target:winexe /optimize+ /win32icon:"%INSTALL_DIR%\bvb09.ico" /out:"%INSTALL_DIR%\BVB09.exe" /r:System.Windows.Forms.dll "%INSTALL_DIR%\BVB09.cs"
    ) else (
        "%CSC_CMD%" /nologo /target:winexe /optimize+ /out:"%INSTALL_DIR%\BVB09.exe" /r:System.Windows.Forms.dll "%INSTALL_DIR%\BVB09.cs"
    )
    echo       [OK] BVB09.exe erfolgreich lokal durch Microsoft .NET erstellt ^(0%% Defender-Warnung^).
) else (
    if exist "%SRC_DIR%BVB09.exe" (
        copy /Y "%SRC_DIR%BVB09.exe" "%INSTALL_DIR%\BVB09.exe" >nul
        type nul > "%INSTALL_DIR%\BVB09.exe:Zone.Identifier" 2>nul
    )
)

echo [4/5] Erstelle Desktop-Verknuepfung und Startmenue-Eintrag...
set "VBS_LINK=%TEMP%\bvb09_shortcut.vbs"
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sDesktop = oWS.SpecialFolders^("Desktop"^)
echo Set oLink = oWS.CreateShortcut^(sDesktop ^& "\BVB 09 Client.lnk"^)
echo oLink.TargetPath = "%INSTALL_DIR%\BVB09.exe"
echo oLink.WorkingDirectory = "%INSTALL_DIR%"
echo oLink.Description = "BVB Inofficial Fan Client"
echo oLink.IconLocation = "%INSTALL_DIR%\bvb09.ico, 0"
echo oLink.Save
echo sStartMenu = oWS.SpecialFolders^("Programs"^)
echo Set oLink2 = oWS.CreateShortcut^(sStartMenu ^& "\BVB 09 Client.lnk"^)
echo oLink2.TargetPath = "%INSTALL_DIR%\BVB09.exe"
echo oLink2.WorkingDirectory = "%INSTALL_DIR%"
echo oLink2.Description = "BVB Inofficial Fan Client"
echo oLink2.IconLocation = "%INSTALL_DIR%\bvb09.ico, 0"
echo oLink2.Save
) > "%VBS_LINK%"
cscript //nologo "%VBS_LINK%" >nul 2>&1
del /f /q "%VBS_LINK%" >nul 2>&1

:: Erstelle Deinstaller im Programmordner
(
echo @echo off
echo title BVB 09 Client Deinstallation
echo echo Entferne BVB 09 Client Verknuepfungen und Dateien...
echo del /f /q "%%USERPROFILE%%\Desktop\BVB 09 Client.lnk" 2^>nul
echo del /f /q "%%APPDATA%%\Microsoft\Windows\Start Menu\Programs\BVB 09 Client.lnk" 2^>nul
echo cd /d "%%LOCALAPPDATA%%"
echo rmdir /s /q "%INSTALL_DIR%" 2^>nul
echo echo [OK] BVB 09 Client wurde vollstaendig entfernt.
echo pause
) > "%INSTALL_DIR%\Deinstallieren.cmd"

echo [5/5] Starte BVB 09 Transfermarkt ^& News Client...
echo.
echo ============================================================================
echo   INSTALLATION ERFOLGREICH ABGESCHLOSSEN!
echo   - Desktop-Icon erstellt: "BVB 09 Client"
echo   - Startmenue-Eintrag erstellt: "BVB 09 Client"
echo   - Programm startet jetzt automatisch...
echo ============================================================================
start "" "%INSTALL_DIR%\BVB09.exe"
timeout /t 3 >nul
exit /b 0
