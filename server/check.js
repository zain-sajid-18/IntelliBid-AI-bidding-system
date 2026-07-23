
import fs from 'fs';
const content = fs.readFileSync('src/modules/auction/auction.job.js', 'utf8');
const lines = content.split('\n');
for (let i = 85; i < 110; i++) {
  console.log(`Line ${i+1}: ${JSON.stringify(lines[i])}`);
}
