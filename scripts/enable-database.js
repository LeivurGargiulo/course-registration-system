#!/usr/bin/env node

// Script to enable PostgreSQL database when DATABASE_URL is properly configured
// Usage: node scripts/enable-database.js

const fs = require('fs');
const path = require('path');

const storageFilePath = path.join(__dirname, '../server/storage.ts');

console.log('Enabling PostgreSQL database...');

try {
  let content = fs.readFileSync(storageFilePath, 'utf8');
  
  // Replace the export statement to use DatabaseStorage instead of MemStorage
  content = content.replace(
    /\/\/ Always use MemStorage[\s\S]*?export const storage = new MemStorage\(\);/,
    `// Use DatabaseStorage now that the database is properly configured
export const storage = new DatabaseStorage();`
  );
  
  fs.writeFileSync(storageFilePath, content);
  console.log('✓ Updated storage.ts to use DatabaseStorage');
  console.log('✓ Server will now use PostgreSQL database');
  console.log('⚠️  Restart the server to apply changes');
} catch (error) {
  console.error('Failed to enable database:', error.message);
  process.exit(1);
}