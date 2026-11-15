const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  return {
    status: res.status,
    ok: res.ok,
    raw: json,
    data: json.data !== undefined ? json.data : json,
    message: json.message || json.error?.message || ''
  };
}

async function runTest() {
  console.log('🧪 Starting State Admin & Super Admin Verification Workflow Test...\n');

  const randomSuffix = Date.now().toString().slice(-4);
  const jharkhandEmail1 = `jharkhand.officer1.${randomSuffix}@myjourney.gov.in`;
  const jharkhandEmail2 = `jharkhand.officer2.${randomSuffix}@myjourney.gov.in`;
  const superAdminProvisionEmail = `jharkhand.deputy.${randomSuffix}@myjourney.gov.in`;

  // Step 1: Check available states
  console.log('1️⃣ Checking GET /api/v1/auth/available-states...');
  const statesRes = await request('/auth/available-states');
  console.log(`✅ Total states returned: ${statesRes.data.states.length}`);
  
  // Pick an unclaimed state dynamically (or Jharkhand if unclaimed, else another like Bihar, Odisha, etc.)
  const targetStateObj = statesRes.data.states.find(s => !s.isClaimed) || { state: 'Bihar' };
  const targetState = targetStateObj.state;
  console.log(`   Selected test state: "${targetState}" (initially claimed: ${targetStateObj.isClaimed})`);

  // Step 2: Self-register first admin for target state
  console.log(`\n2️⃣ Self-registering State Admin for ${targetState}...`);
  const reg1Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: `${targetState} Transport Officer`,
      email: jharkhandEmail1,
      password: 'Password@123',
      phone: '9876543210',
      role: 'ADMIN',
      assignedState: targetState
    })
  });
  console.log(`✅ Registration response status: ${reg1Res.status}`);
  console.log(`   User: ${reg1Res.data.user.email}, State: ${reg1Res.data.user.assignedState}`);
  console.log(`   Verification Status: ${reg1Res.data.user.verificationStatus} (Should be PENDING)`);
  if (reg1Res.data.user.verificationStatus !== 'PENDING') {
    throw new Error('Expected verificationStatus to be PENDING');
  }

  // Step 3: Check that target state is now claimed
  console.log(`\n3️⃣ Verifying ${targetState} is claimed in available-states...`);
  const statesRes2 = await request('/auth/available-states');
  const targetStateClaimed = statesRes2.data.states.find(s => s.state === targetState);
  console.log(`   ${targetState} isClaimed: ${targetStateClaimed.isClaimed}, adminCount: ${targetStateClaimed.adminCount}`);
  if (!targetStateClaimed.isClaimed) {
    throw new Error(`Expected ${targetState} to be isClaimed: true`);
  }

  // Step 4: Attempt second self-registration for target state (Should fail with 409)
  console.log(`\n4️⃣ Attempting second self-registration for ${targetState} (Exclusivity Check)...`);
  const reg2Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: `Another ${targetState} Applicant`,
      email: jharkhandEmail2,
      password: 'Password@123',
      phone: '9876543211',
      role: 'ADMIN',
      assignedState: targetState
    })
  });
  if (reg2Res.status === 409) {
    console.log(`✅ Correctly rejected with 409: "${reg2Res.message}"`);
  } else {
    throw new Error(`❌ Expected 409 Conflict but received ${reg2Res.status}: ${JSON.stringify(reg2Res.raw)}`);
  }

  // Step 5: Super Admin logs in
  console.log('\n5️⃣ Logging in as Super Admin (admin@myjourney.in)...');
  const superLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@myjourney.in',
      password: 'Password@123'
    })
  });
  if (!superLoginRes.ok) {
    throw new Error(`Super Admin login failed: ${JSON.stringify(superLoginRes.raw)}`);
  }
  const superToken = superLoginRes.data.token;
  console.log(`✅ Super Admin logged in successfully.`);

  // Step 6: Super Admin lists state admins
  console.log('\n6️⃣ Super Admin fetching GET /api/v1/admin/state-admins...');
  const adminsListRes = await request('/admin/state-admins', {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  console.log(`✅ Total admins found: ${adminsListRes.data.admins.length}`);
  const pendingOfficer = adminsListRes.data.admins.find(a => a.email === jharkhandEmail1);
  if (!pendingOfficer) {
    throw new Error('Pending officer not found in state-admins list');
  }
  console.log(`   Found pending officer: ${pendingOfficer.name} (${pendingOfficer.assignedState}), Status: ${pendingOfficer.verificationStatus}`);

  // Step 7: Super Admin approves the target state admin
  console.log(`\n7️⃣ Super Admin approving ${targetState} admin via PATCH /admin/state-admins/:id/verify...`);
  const verifyRes = await request(`/admin/state-admins/${pendingOfficer._id}/verify`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${superToken}` }
  });
  console.log(`✅ Verification response:`, verifyRes.message);
  console.log(`   New status: ${verifyRes.data.admin.verificationStatus}`);
  if (verifyRes.data.admin.verificationStatus !== 'VERIFIED') {
    throw new Error('Expected status to be VERIFIED');
  }

  // Step 8: Super Admin provisions a SECOND admin for target state (allowed for Super Admin)
  console.log(`\n8️⃣ Super Admin provisioning a 2nd admin for ${targetState} via POST /admin/state-admins...`);
  const provisionRes = await request('/admin/state-admins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: JSON.stringify({
      name: `${targetState} Deputy Officer`,
      email: superAdminProvisionEmail,
      password: 'Password@123',
      phone: '9876543212',
      assignedState: targetState,
      verificationStatus: 'VERIFIED'
    })
  });
  console.log(`✅ 2nd Admin provisioned: ${provisionRes.data.admin.email}, State: ${provisionRes.data.admin.assignedState}, Status: ${provisionRes.data.admin.verificationStatus}`);

  // Step 9: Verify state admin can log in and view their state scope
  console.log(`\n9️⃣ Logging in as approved ${targetState} admin...`);
  const jharkhandLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: jharkhandEmail1,
      password: 'Password@123'
    })
  });
  const jharkhandToken = jharkhandLoginRes.data.token;
  console.log(`✅ ${targetState} admin logged in. verificationStatus: ${jharkhandLoginRes.data.user.verificationStatus}`);

  // Step 10: Fetch trips as target state admin
  console.log(`\n🔟 Fetching trips as ${targetState} admin...`);
  const tripsRes = await request('/admin/trips', {
    headers: { Authorization: `Bearer ${jharkhandToken}` }
  });
  console.log(`✅ Trips retrieved: ${tripsRes.data.trips.length} trips.`);

  console.log('\n🎉 ALL 10 STATE ADMIN & SUPER ADMIN WORKFLOW CHECKS PASSED PERFECTLY!\n');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
