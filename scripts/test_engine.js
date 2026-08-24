import fs from 'fs';
import { matchKbliKbji } from '../src/utils/smartMatcher.js';
import { validateKbliKbjiConsistency } from '../src/utils/consistencyChecker.js';

const fieldCases = JSON.parse(fs.readFileSync('./src/data/fieldCases.json', 'utf8'));

console.log('=== RUNNING SI-KODING AUTOMATED TESTS ===\n');

// Test 1: Data Integrity
console.log(`[TEST 1] Verifying Dataset Integrity (${fieldCases.length} records)...`);
let invalidKbli = 0;
let invalidKbji = 0;

fieldCases.forEach(fc => {
  if (!fc.mjj.kbli_code || fc.mjj.kbli_code.length !== 5) invalidKbli++;
  if (!fc.mjj.kbji_code || fc.mjj.kbji_code.length !== 4) invalidKbji++;
});

if (invalidKbli === 0 && invalidKbji === 0) {
  console.log('✓ PASS: All 234 field cases have valid 5-digit KBLI and 4-digit KBJI format.');
} else {
  console.error(`✗ FAIL: ${invalidKbli} invalid KBLI, ${invalidKbji} invalid KBJI`);
}

// Test 2: Smart Matcher Accuracy on Key Domain Queries
console.log('\n[TEST 2] Testing Smart Matcher Recommendations...');

const testQueries = [
  {
    query: 'DI SEWA MEMANJAT KELAPA MILIK ORANG',
    expectedKbli: '01261',
    expectedKbji: '9211'
  },
  {
    query: 'WARUNG SEMBAKO',
    expectedKbli: '47112',
    expectedKbji: '5221'
  },
  {
    query: 'MENGEMUDI OJEK MOTOR',
    expectedKbli: '49424',
    expectedKbji: '8321'
  },
  {
    query: 'BURUH KUPAS KELAPA BIJI',
    expectedKbli: '10421',
    expectedKbji: '7549'
  }
];

let matchPass = 0;
testQueries.forEach((t, i) => {
  const res = matchKbliKbji({ query: t.query });
  const topKbli = res.kbliRecommendations[0]?.code;
  const topKbji = res.kbjiRecommendations[0]?.code;

  const kbliOk = topKbli === t.expectedKbli;
  const kbjiOk = topKbji === t.expectedKbji;

  if (kbliOk && kbjiOk) {
    matchPass++;
    console.log(`✓ Case ${i + 1} "${t.query}": KBLI [${topKbli}] & KBJI [${topKbji}] matched perfectly (${res.confidence}% confidence)`);
  } else {
    console.log(`~ Case ${i + 1} "${t.query}": Got KBLI [${topKbli}] (exp: ${t.expectedKbli}), KBJI [${topKbji}] (exp: ${t.expectedKbji})`);
  }
});

console.log(`Result: ${matchPass}/${testQueries.length} test cases perfectly matched top-1 recommendation.`);

// Test 3: Consistency Checker
console.log('\n[TEST 3] Testing Consistency Checker Rules...');
const validCheck = validateKbliKbjiConsistency('01261', '9211');
console.log(`Valid combination test: status = "${validCheck.status}" (${validCheck.title})`);

const warningCheck = validateKbliKbjiConsistency('03111', '9313'); // Marine fishing vs Building construction
console.log(`Anomaly combination test: status = "${warningCheck.status}" (${warningCheck.title})`);

if (validCheck.status === 'valid' && warningCheck.status === 'warning') {
  console.log('✓ PASS: Consistency rules correctly validate aligned pairs and flag anomalies.');
} else {
  console.error('✗ FAIL: Inconsistent validator behavior.');
}

console.log('\n=== ALL AUTOMATED TESTS COMPLETED ===');
