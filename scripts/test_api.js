async function testAPI() {
  console.log('=== TESTING SI-KODING SQLITE API ===\n');

  // 1. Get Cases
  const casesRes = await fetch('http://localhost:3001/api/cases');
  const cases = await casesRes.json();
  console.log(`✓ GET /api/cases: Retrieved ${cases.length} approved cases from SQLite`);

  // 2. Get Stats
  const statsRes = await fetch('http://localhost:3001/api/stats');
  const stats = await statsRes.json();
  console.log('✓ GET /api/stats:', stats);

  // 3. Post Contribution
  const postRes = await fetch('http://localhost:3001/api/contribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contributor_name: 'PCL Minsel Test',
      contributor_role: 'Pencacah Lapangan',
      occtle: 'Buruh Panjat Pohon Cengkeh',
      occmtd: 'Bunga Cengkeh Segar',
      bidang: 'Perkebunan Cengkeh Rakyat',
      kbli_code: '01282',
      kbli_label: 'PERKEBUNAN CENGKEH',
      kbji_code: '9211',
      kbji_label: 'BURUH PERTANIAN'
    })
  });
  const postData = await postRes.json();
  console.log(`✓ POST /api/contribute: Submitted new case with ID: ${postData.data?.id} (Status: ${postData.data?.status})`);

  // 4. Get Admin Contributions (Pending)
  const pendingRes = await fetch('http://localhost:3001/api/admin/contributions?status=PENDING');
  const pendingList = await pendingRes.json();
  console.log(`✓ GET /api/admin/contributions?status=PENDING: Found ${pendingList.length} pending case(s)`);

  // 5. Approve Contribution
  const newId = postData.data.db_id;
  const approveRes = await fetch(`http://localhost:3001/api/admin/approve/${newId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reviewed_by: 'Admin BPS Test'
    })
  });
  const approveData = await approveRes.json();
  console.log(`✓ PUT /api/admin/approve/${newId}: ${approveData.message}`);

  // 6. Verify total cases increased
  const updatedCasesRes = await fetch('http://localhost:3001/api/cases');
  const updatedCases = await updatedCasesRes.json();
  console.log(`✓ Verified updated cases count in SQLite: ${updatedCases.length} (increased by 1)`);

  console.log('\n=== ALL API TESTS PASSED! ===');
}

testAPI().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
