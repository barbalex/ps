#!/usr/bin/env node

/**
 * Schema generator that removes all foreign key constraints from the main schema file.
 * Usage: node generate_no_fk_schema.mjs
 * 
 * This script:
 * 1. Reads backend/db/init/04_createTables.sql
 * 2. Removes all inline REFERENCES clauses in column definitions
 * 3. Removes all ALTER TABLE ADD CONSTRAINT FOREIGN KEY statements
 * 4. Outputs to backend/db/init/04_createTables.no_fk.sql
 * 5. Validates that no FK patterns remain
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(__dirname, '../db/init/04_createTables.sql');
const outputFile = path.join(__dirname, '../db/init/04_createTables.no_fk.sql');

console.log(`📖 Reading schema file: ${inputFile}`);
let content = fs.readFileSync(inputFile, 'utf-8');

const originalSize = content.length;
let removed = 0;

// Pattern 1: Remove inline REFERENCES clauses from column definitions
// Matches: REFERENCES table_name(...) [ON DELETE|UPDATE ...] [DEFERRABLE INITIALLY DEFERRED]
// Handles multi-line cases with proper whitespace
const referencePattern = /\s*REFERENCES\s+\w+\s*\([^)]*\)\s*(?:ON\s+(?:DELETE|UPDATE)\s+(?:CASCADE|SET\s+NULL|NO\s+ACTION|RESTRICT))*\s*(?:ON\s+(?:DELETE|UPDATE)\s+(?:CASCADE|SET\s+NULL|NO\s+ACTION|RESTRICT))*\s*(?:DEFERRABLE\s+INITIALLY\s+DEFERRED)?/gi;

content = content.replace(referencePattern, (match) => {
  removed += match.length;
  return '';
});

// Pattern 2: Remove ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY statements (full form)
// These are typically on their own lines and span multiple lines
const alterTablePattern = /ALTER\s+TABLE\s+\w+\s+ADD\s+CONSTRAINT\s+\w+_fkey\s+FOREIGN\s+KEY\s+\([^)]*\)\s+REFERENCES\s+\w+\s*\([^)]*\)(?:\s+ON\s+(?:DELETE|UPDATE)\s+(?:CASCADE|SET\s+NULL|NO\s+ACTION|RESTRICT))*\s*(?:DEFERRABLE\s+INITIALLY\s+DEFERRED)?[;]?/gi;

content = content.replace(alterTablePattern, (match) => {
  removed += match.length;
  return '';
});

// Pattern 2b: Remove ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY statements (partial, after REFERENCES removed)
// Matches: ALTER TABLE table_name ADD CONSTRAINT constraint_name FOREIGN KEY (...)
const alterTablePartialPattern = /ALTER\s+TABLE\s+\w+\s+ADD\s+CONSTRAINT\s+\w+_fkey\s+FOREIGN\s+KEY\s+\([^)]*\)[;]?/gi;

content = content.replace(alterTablePartialPattern, (match) => {
  removed += match.length;
  return '';
});

// Pattern 3: Clean up any leftover extra commas/whitespace from removed columns
// If we have ", ," remove the extra comma
content = content.replace(/,\s*,/g, ',');

// Pattern 4: Clean up UNIQUE constraints that lost values
// This shouldn't happen but just in case
content = content.replace(/,\s*\)/g, ')');

// Pattern 5: Remove lines that are now empty (from removed ALTER statements)
content = content.replace(/^\s*REFERENCES.*$/gm, '');

// Write output file
console.log(`✍️  Writing no-FK schema file: ${outputFile}`);
fs.writeFileSync(outputFile, content, 'utf-8');

// Validation
const referencesCount = (content.match(/REFERENCES/gi) || []).length;
const foreignKeyCount = (content.match(/FOREIGN\s+KEY/gi) || []).length;
const constraintFkeyCount = (content.match(/_fkey\s+FOREIGN/gi) || []).length;

console.log('\n📊 Validation Results:');
console.log(`   Original size: ${originalSize} bytes`);
console.log(`   Output size: ${content.length} bytes`);
console.log(`   Removed: ${removed} bytes`);
console.log(`   REFERENCES patterns remaining: ${referencesCount}`);
console.log(`   FOREIGN KEY patterns remaining: ${foreignKeyCount}`);
console.log(`   Constraint FK patterns remaining: ${constraintFkeyCount}`);

if (referencesCount === 0 && foreignKeyCount === 0 && constraintFkeyCount === 0) {
  console.log('\n✅ Success! All foreign key constraints removed.');
  console.log(`\n💾 Generated file: ${path.relative(process.cwd(), outputFile)}`);
  process.exit(0);
} else {
  console.log('\n⚠️  Warning: Some FK patterns may remain. Please review output.');
  console.log(`\n📋 Generated file (review needed): ${path.relative(process.cwd(), outputFile)}`);
  process.exit(1);
}
