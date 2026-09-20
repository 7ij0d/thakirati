const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const desktop = path.join(process.env.USERPROFILE, 'Desktop');

// Remove broken shortcuts
try {
  const files = fs.readdirSync(desktop);
  for (const file of files) {
    if (file.endsWith('.lnk') && (file.includes('?') || file.includes('') || file.includes('詢'))) {
      fs.unlinkSync(path.join(desktop, file));
      console.log('Removed old shortcut:', file);
    }
  }
} catch (e) {}

const shortcutPath = path.join(desktop, 'ذاكرتي.lnk');
const icoPath = 'C:\\Users\\Taha\\.gemini\\antigravity\\scratch\\thakirati\\public\\app.ico';

// VBScript with UTF-16LE encoding supports Arabic perfectly on Windows
const vbsPath = path.join(process.env.TEMP, 'make_shortcut.vbs');
const vbsContent = [
  'Set WshShell = CreateObject("WScript.Shell")',
  `Set sc = WshShell.CreateShortcut("${shortcutPath}")`,
  'sc.TargetPath = "msedge.exe"',
  'sc.Arguments = "--app=https://7ij0d.github.io/thakirati/ --window-size=1200,850"',
  'sc.Description = "ذاكرتي | المساعد الشخصي لمنع النسيان"',
  `sc.IconLocation = "${icoPath},0"`,
  'sc.WorkingDirectory = "C:\\Users\\Taha"',
  'sc.Save'
].join('\r\n');

fs.writeFileSync(vbsPath, vbsContent, 'utf16le');
execSync(`cscript //nologo "${vbsPath}"`);
fs.unlinkSync(vbsPath);

console.log('Shortcut created successfully:', shortcutPath);
