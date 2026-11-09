using System;
using System.IO;
using System.Diagnostics;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("BVB Inofficial Fan Client")]
[assembly: AssemblyDescription("Borussia Dortmund 09 Standalone Desktop Application")]
[assembly: AssemblyCompany("BVB 09 Fan Community")]
[assembly: AssemblyProduct("BVB Inofficial Fan Client")]
[assembly: AssemblyCopyright("Copyright (c) 2026 BVB 09 Client")]
[assembly: AssemblyVersion("1.909.1.0")]
[assembly: AssemblyFileVersion("1.909.1.0")]

namespace BVB09Client
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string appHtml = Path.Combine(baseDir, "BVB09-App.html");

            if (!File.Exists(appHtml))
            {
                string localAppDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Programs", "BVB 09 Client", "BVB09-App.html"
                );
                if (File.Exists(localAppDir))
                {
                    appHtml = localAppDir;
                }
            }

            if (!File.Exists(appHtml))
            {
                MessageBox.Show(
                    "Die Anwendungsdatei 'BVB09-App.html' wurde nicht im Programmverzeichnis gefunden.\nBitte führe 'Installation-Starten.cmd' aus.",
                    "BVB 09 Client",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
                return;
            }

            string fileUri = new Uri(appHtml).AbsoluteUri;
            string[] browserCandidates = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
            };

            foreach (string browserPath in browserCandidates)
            {
                if (File.Exists(browserPath))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = browserPath;
                        psi.Arguments = "--app=\"" + fileUri + "\" --window-size=1420,920 --allow-file-access-from-files";
                        psi.UseShellExecute = false;
                        Process.Start(psi);
                        return;
                    }
                    catch { }
                }
            }

            // Fallback: Standardbrowser öffnen
            try
            {
                Process.Start(new ProcessStartInfo(fileUri) { UseShellExecute = true });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Fehler beim Starten: " + ex.Message, "BVB 09 Client", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
