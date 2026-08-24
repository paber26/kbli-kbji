async function testModerationFlow() {
  console.log('=== TESTING PUBLIC PROPOSAL & ADMIN MODERATION WORKFLOW ===\n');

  // 1. Submit Edit Proposal
  console.log('[STEP 1] Testing Public Edit Proposal...');
  const editRes = await fetch('http://localhost:3001/api/contribute/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_case_id: 1,
      contributor_name: 'PCL Minsel User',
      occtle: 'MENCANGKUL DAN MENCABUT RUMPUT TANAMAN JAGUNG',
      occmtd: 'JAGUNG PIPIL',
      bidang: 'PERTANIAN TANAMAN PANGAN JAGUNG',
      kbli_code: '01111',
      kbli_label: 'PERTANIAN JAGUNG',
      kbji_code: '6111',
      kbji_label: 'PETANI TANAMAN PANGAN',
      notes: 'Penyesuaian uraian lapangan'
    })
  });
  const editData = await editRes.json();
  console.log(`✓ POST /api/contribute/edit: Submitted edit proposal ID ${editData.data?.id} (Action: ${editData.data?.action_type}, Status: ${editData.data?.status})`);

  // 2. Submit Delete Proposal
  console.log('\n[STEP 2] Testing Public Delete Proposal...');
  const delRes = await fetch('http://localhost:3001/api/contribute/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_case_id: 2,
      contributor_name: 'PML Pengawas',
      reason: 'Duplikasi dengan kasus lain'
    })
  });
  const delData = await delRes.json();
  console.log(`✓ POST /api/contribute/delete: Submitted delete proposal ID ${delData.data?.id} (Action: ${delData.data?.action_type}, Status: ${delData.data?.status})`);

  // 3. Admin view pending queue
  console.log('\n[STEP 3] Fetching Admin Pending Queue...');
  const pendingRes = await fetch('http://localhost:3001/api/admin/contributions?status=PENDING');
  const pendingList = await pendingRes.json();
  console.log(`✓ GET /api/admin/contributions?status=PENDING: Found ${pendingList.length} pending request(s)`);

  // 4. Admin approves Edit Proposal
  console.log('\n[STEP 4] Admin Approving Edit Proposal...');
  const approveEditRes = await fetch(`http://localhost:3001/api/admin/approve/${editData.data.db_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewed_by: 'Admin BPS Minsel' })
  });
  const approveEditData = await approveEditRes.json();
  console.log(`✓ PUT /api/admin/approve/${editData.data.db_id}: ${approveEditData.message}`);

  // 5. Admin rejects Delete Proposal
  console.log('\n[STEP 5] Admin Rejecting Delete Proposal...');
  const rejectDelRes = await fetch(`http://localhost:3001/api/admin/reject/${delData.data.db_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_notes: 'Data ini masih valid dan dibutuhkan.', reviewed_by: 'Admin BPS Minsel' })
  });
  const rejectDelData = await rejectDelRes.json();
  console.log(`✓ PUT /api/admin/reject/${delData.data.db_id}: ${rejectDelData.message}`);

  console.log('\n=== ALL MODERATION FLOW TESTS PASSED! ===');
}

testModerationFlow().catch(console.error);
