using System;
using System.IO;
using System.Diagnostics;
using System.Reflection;
using System.Windows.Forms;
using System.Drawing;

[assembly: AssemblyTitle("BVB Inofficial Fan Client Setup")]
[assembly: AssemblyDescription("Offizieller Windows 10/11 Setup-Assistent (Loesung 4)")]
[assembly: AssemblyCompany("BVB 09 Fan Community")]
[assembly: AssemblyProduct("BVB Inofficial Fan Client")]
[assembly: AssemblyCopyright("Copyright (c) 2026 BVB 09 Client")]
[assembly: AssemblyVersion("1.909.2.0")]
[assembly: AssemblyFileVersion("1.909.2.0")]

namespace BVB09Setup
{
    static class SetupProgram
    {
        static void ExtractResource(string resName, string outPath)
        {
            using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream(resName))
            {
                if (s == null) return;
                using (FileStream fs = new FileStream(outPath, FileMode.Create, FileAccess.Write))
                {
                    s.CopyTo(fs);
                }
            }
        }

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string installDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Programs", "BVB 09 Client"
                );
                Directory.CreateDirectory(installDir);

                string htmlPath = Path.Combine(installDir, "BVB09-App.html");
                string icoPath = Path.Combine(installDir, "bvb09.ico");
                string csPath = Path.Combine(installDir, "BVB09.cs");
                string exePath = Path.Combine(installDir, "BVB09.exe");

                ExtractResource("BVB09-App.html", htmlPath);
                ExtractResource("bvb09.ico", icoPath);
                ExtractResource("BVB09.cs", csPath);

                // Compile BVB09.exe locally using Windows built-in Microsoft C# compiler (csc.exe)
                string csc64 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), @"Microsoft.NET\Framework64\v4.0.30319\csc.exe");
                string csc32 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), @"Microsoft.NET\Framework\v4.0.30319\csc.exe");
                string csc = File.Exists(csc64) ? csc64 : (File.Exists(csc32) ? csc32 : null);

                if (csc != null && File.Exists(csPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = csc;
                    psi.Arguments = "/nologo /target:winexe /optimize+ /win32icon:\"" + icoPath + "\" /out:\"" + exePath + "\" /r:System.Windows.Forms.dll \"" + csPath + "\"";
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    Process p = Process.Start(psi);
                    if (p != null) p.WaitForExit(10000);
                }

                // Create Desktop and Start Menu shortcuts via WScript.Shell COM late binding
                try
                {
                    Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                    if (shellType != null)
                    {
                        object shell = Activator.CreateInstance(shellType);
                        string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                        string startMenuDir = Environment.GetFolderPath(Environment.SpecialFolder.Programs);

                        foreach (string folder in new string[] { desktopDir, startMenuDir })
                        {
                            string lnkPath = Path.Combine(folder, "BVB 09 Client.lnk");
                            object shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { lnkPath });
                            Type scType = shortcut.GetType();
                            scType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { File.Exists(exePath) ? exePath : htmlPath });
                            scType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { installDir });
                            scType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { "BVB Inofficial Fan Client" });
                            scType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { icoPath + ", 0" });
                            scType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
                        }
                    }
                }
                catch { }

                // Launch the locally compiled BVB09.exe (or BVB09-App.html directly)
                if (File.Exists(exePath))
                {
                    Process.Start(new ProcessStartInfo(exePath) { WorkingDirectory = installDir, UseShellExecute = true });
                }
                else if (File.Exists(htmlPath))
                {
                    Process.Start(new ProcessStartInfo(htmlPath) { UseShellExecute = true });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Fehler bei der Installation: " + ex.Message, "BVB 09 Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
