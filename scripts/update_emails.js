const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'emails');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'EmailLayout.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace NAVY with CHARCOAL in imports
  content = content.replace(/ NAVY/g, ' CHARCOAL');
  content = content.replace(/NAVY,/g, 'CHARCOAL,');
  
  // Replace NAVY with CHARCOAL in code
  content = content.replace(/NAVY/g, 'CHARCOAL');

  // Update Button styles
  content = content.replace(/padding:\s*'15px 32px'/g, "padding: '16px 36px'");
  content = content.replace(/letterSpacing:\s*'0\.25em'/g, "letterSpacing: '0.3em'");
  content = content.replace(/letterSpacing:\s*'0\.2em'/g, "letterSpacing: '0.3em'");
  
  // Add border to buttons that have backgroundColor: CHARCOAL
  content = content.replace(/(backgroundColor:\s*CHARCOAL[^}]*)(\s*\})/g, "$1, border: `1px solid ${CHARCOAL}`$2");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
