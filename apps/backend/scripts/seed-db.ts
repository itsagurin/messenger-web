import { exec } from 'child_process';
import * as path from 'path';

const seedScript = path.resolve(__dirname, '../prisma/seed.ts');

console.log('Running database seed script...');
exec(`npx ts-node ${seedScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing seed script: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Seed script stderr: ${stderr}`);
  }

  console.log(`Seed script output: ${stdout}`);
});