const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'src', 'pages', 'Admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx') && f !== 'AdminNav.jsx' && f !== 'AdminSidebar.jsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove import
  content = content.replace(/import AdminNav from ['"]\.\/AdminNav['"];?\n?/g, '');
  content = content.replace(/import AdminNav from ['"]\.\.\/Admin\/AdminNav['"];?\n?/g, '');
  
  // Remove component
  content = content.replace(/<AdminNav \/>\n?/g, '');
  
  // Remove min-h-screen if it exists (since layout handles it)
  content = content.replace(/min-h-screen /g, '');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
}
