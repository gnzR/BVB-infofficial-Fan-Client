; ==============================================================================
; BVB 09 Transfermarkt & News Client - Windows 10/11 NSIS Installer Script
; ==============================================================================

Unicode True
RequestExecutionLevel user ; Allows installation without admin rights, or elevates if needed

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"

; --- General Settings ---
Name "BVB 09 Transfermarkt & News Client"
OutFile "BVB-09-Windows-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\BVB 09 Client"
InstallDirRegKey HKCU "Software\BVB09Client" "Install_Dir"

; --- Branding & Icons ---
!define MUI_ICON "bvb09.ico"
!define MUI_UNICON "bvb09.ico"
!define MUI_ABORTWARNING
!define MUI_HEADERIMAGE
!define MUI_WELCOMEPAGE_TITLE "Willkommen beim BVB 09 Client Setup"
!define MUI_WELCOMEPAGE_TEXT "Dieser Assistent wird den BVB 09 Transfermarkt & News Client auf Ihrem Windows 10/11 System installieren.\r\n\r\nFeatures:\r\n- Echzeit-News von BVBWLD.de, Transfermarkt, Kicker & Ruhr Nachrichten\r\n- Live Transfer-Radar & Marktwerte\r\n- Detaillierte ESPN-Match-Statistiken\r\n- Automatisches Öffnen von Artikeln im Standard-Browser\r\n\r\nKlicken Sie auf Weiter, um fortzufahren."

; --- UI Pages ---
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page with auto-run option
!define MUI_FINISHPAGE_RUN "$INSTDIR\BVB09.exe"
!define MUI_FINISHPAGE_RUN_TEXT "BVB 09 Client jetzt starten"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "German"

; --- Installer Section ---
Section "Hauptprogramm (erforderlich)" SecMain
    SectionIn RO

    ; Stop any existing running instance of BVB09.exe before updating files
    nsExec::Exec 'taskkill /F /IM BVB09.exe'
    
    SetOutPath "$INSTDIR"
    File "BVB09.exe"
    File "bvb09.ico"

    ; Copy web application folder
    SetOutPath "$INSTDIR\app"
    File /r "app\*.*"

    ; Reset working directory to $INSTDIR for shortcuts and Finish Page auto-run
    SetOutPath "$INSTDIR"

    ; Registry keys for uninstaller
    WriteRegStr HKCU "Software\BVB09Client" "Install_Dir" "$INSTDIR"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "DisplayName" "BVB 09 Transfermarkt & News Client"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "DisplayIcon" "$INSTDIR\bvb09.ico"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "DisplayVersion" "2.5.0"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "Publisher" "Borussia Dortmund 09 Community"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "NoModify" 1
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client" "NoRepair" 1

    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"

    ; Start Menu Shortcuts
    CreateDirectory "$SMPROGRAMS\BVB 09 Client"
    CreateShortcut "$SMPROGRAMS\BVB 09 Client\BVB 09 Client.lnk" "$INSTDIR\BVB09.exe" "" "$INSTDIR\bvb09.ico" 0
    CreateShortcut "$SMPROGRAMS\BVB 09 Client\Deinstallieren.lnk" "$INSTDIR\uninstall.exe" "" "" 0

    ; Desktop Shortcut
    CreateShortcut "$DESKTOP\BVB 09 Client.lnk" "$INSTDIR\BVB09.exe" "" "$INSTDIR\bvb09.ico" 0
SectionEnd

; --- Dependency Verification Section ---
Section "Abhängigkeiten prüfen" SecDeps
    DetailPrint "Überprüfe Windows-Komponenten (Microsoft Edge / WebView2)..."
    
    ; Check if msedge.exe is present in standard locations
    StrCpy $0 "0"
    ${If} ${FileExists} "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        StrCpy $0 "1"
    ${ElseIf} ${FileExists} "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
        StrCpy $0 "1"
    ${ElseIf} ${FileExists} "C:\Program Files\Google\Chrome\Application\chrome.exe"
        StrCpy $0 "1"
    ${ElseIf} ${FileExists} "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        StrCpy $0 "1"
    ${EndIf}

    ${If} $0 == "1"
        DetailPrint "Kompatible Browser-Engine gefunden (Microsoft Edge / Chrome vorhanden)."
    ${Else}
        DetailPrint "Microsoft Edge nicht in Standardpfaden gefunden. Installiere WebView2 Runtime..."
        ; Run silent background download and install of Evergreen WebView2 via PowerShell
        nsExec::Exec 'powershell -WindowStyle Hidden -Command "try { Invoke-WebRequest -Uri \"https://go.microsoft.com/fwlink/p/?LinkId=2124703\" -OutFile \"$TEMP\MicrosoftEdgeWebview2Setup.exe\"; Start-Process \"$TEMP\MicrosoftEdgeWebview2Setup.exe\" -ArgumentList \"/silent /install\" -Wait } catch {}"'
        DetailPrint "WebView2 Runtime Installation abgeschlossen."
    ${EndIf}
SectionEnd

; --- Uninstaller Section ---
Section "Uninstall"
    ; Stop running BVB09.exe instance before removing files
    nsExec::Exec 'taskkill /F /IM BVB09.exe'

    ; Remove files
    Delete "$INSTDIR\BVB09.exe"
    Delete "$INSTDIR\bvb09.ico"
    Delete "$INSTDIR\uninstall.exe"
    RMDir /r "$INSTDIR\app"
    RMDir "$INSTDIR"
    RMDir /r "$LOCALAPPDATA\BVB09Client"

    ; Remove shortcuts
    Delete "$DESKTOP\BVB 09 Client.lnk"
    Delete "$SMPROGRAMS\BVB 09 Client\BVB 09 Client.lnk"
    Delete "$SMPROGRAMS\BVB 09 Client\Deinstallieren.lnk"
    RMDir "$SMPROGRAMS\BVB 09 Client"

    ; Remove registry keys
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\BVB09Client"
    DeleteRegKey HKCU "Software\BVB09Client"
SectionEnd
