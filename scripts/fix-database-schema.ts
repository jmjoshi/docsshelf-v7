/**
 * Database Schema Fix Script
 * Manually adds missing encryption_hmac columns to documents table
 * Run this if migration from v2 to v3 failed
 */

import { getDatabase } from '../src/services/database/dbInit';

async function fixDatabaseSchema() {
  const db = getDatabase();
  
  try {
    console.log('Checking database schema...');
    
    // Check if columns exist
    const tableInfo = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(documents)'
    );
    
    console.log('Current columns:', tableInfo.map(col => col.name).join(', '));
    
    const hasHmac = tableInfo.some(col => col.name === 'encryption_hmac');
    const hasHmacKey = tableInfo.some(col => col.name === 'encryption_hmac_key');
    
    if (hasHmac && hasHmacKey) {
      console.log('✅ Database schema is correct - HMAC columns exist');
      return;
    }
    
    console.log('⚠️  Missing HMAC columns, adding them now...');
    
    // Add missing columns
    if (!hasHmac) {
      console.log('Adding encryption_hmac column...');
      await db.execAsync('ALTER TABLE documents ADD COLUMN encryption_hmac TEXT;');
      console.log('✅ encryption_hmac column added');
    }
    
    if (!hasHmacKey) {
      console.log('Adding encryption_hmac_key column...');
      await db.execAsync('ALTER TABLE documents ADD COLUMN encryption_hmac_key TEXT;');
      console.log('✅ encryption_hmac_key column added');
    }
    
    // Verify
    const updatedTableInfo = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(documents)'
    );
    console.log('Updated columns:', updatedTableInfo.map(col => col.name).join(', '));
    
    console.log('✅ Database schema fixed successfully!');
    console.log('Note: Old documents without HMAC cannot be decrypted and should be re-uploaded');
    
  } catch (error) {
    console.error('❌ Failed to fix database schema:', error);
    throw error;
  }
}

// Run the fix
fixDatabaseSchema()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
