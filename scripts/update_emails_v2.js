const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'emails');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && !['EmailLayout.tsx', 'InvitationEmail.tsx', 'ResetPassword.tsx', 'VerifyEmail.tsx'].includes(f));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Change Button import
  content = content.replace(/import \{ Button, Text \} from '@react-email\/components'/g, "import { Text } from '@react-email/components'");
  content = content.replace(/import \{ Button \} from '@react-email\/components'/g, "");
  
  // Update imports from EmailLayout
  if (!content.includes('ActionButton')) {
    content = content.replace(/, sans \} from '\.\/EmailLayout'/g, ", sans, ActionButton } from './EmailLayout'");
  }

  // Replace Button element with ActionButton
  content = content.replace(/<Button[^>]*href=\{([^}]+)\}[^>]*>([\s\S]*?)<\/Button>/g, "<ActionButton href={$1}>$2</ActionButton>");

  // Remove the old warning text block at the bottom
  content = content.replace(/<Text style={{ fontFamily: sans, fontSize: '12px', color: MUTED, lineHeight: '1.7', margin: 0, padding: '16px 20px', backgroundColor: VELLUM, borderTop: `1px solid \$\{GOLD\}` }}>[\s\S]*?<\/Text>/g, 
    "<Text style={{ fontFamily: sans, fontSize: '10px', color: MUTED, lineHeight: '1.6', margin: '40px 0 0 0', textAlign: 'center' }}>If you did not request this, please disregard this email. For any concerns, contact us at{' '}<a href=\"mailto:info@saltroutegroup.com\" style={{ color: CHARCOAL, textDecoration: 'none' }}>info@saltroutegroup.com</a>.</Text>"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
