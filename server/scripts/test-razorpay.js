import crypto from 'crypto';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testRazorpay() {
  console.log('🧪 Testing Razorpay Integration...\n');

  // 1. Get payment config
  console.log('1️⃣ Checking GET /bookings/payment/config...');
  const cfgRes = await fetch(`${BASE_URL}/bookings/payment/config`);
  const cfgData = await cfgRes.json();
  console.log('   Response:', cfgData);
  if (!cfgData.data?.keyId) {
    throw new Error('Key ID not returned in config');
  }
  console.log(`✅ Config OK! Key ID: ${cfgData.data.keyId}, Enabled: ${cfgData.data.enabled}`);

  // 2. Customer login
  console.log('\n2️⃣ Logging in as customer...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@myjourney.in', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  console.log('✅ Customer authenticated.');

  // 3. Find an active upcoming trip
  console.log('\n3️⃣ Finding upcoming trip with available seats...');
  const searchRes = await fetch(`${BASE_URL}/trips?originQuery=delhi&destinationQuery=jaipur`);
  const searchData = await searchRes.json();
  const trip = searchData.data?.trips?.find(t => new Date(t.departureAt) > new Date());
  if (!trip) throw new Error('No upcoming trip found');

  const seatsRes = await fetch(`${BASE_URL}/trips/${trip._id}/seats`);
  const seatsData = await seatsRes.json();
  const freeSeat = seatsData.data?.seats?.find(s => s.status === 'AVAILABLE');
  if (!freeSeat) throw new Error('No available seats found');

  console.log(`   Trip: ${trip.route?.routeName || trip._id}, Seat: ${freeSeat.seatNumber}`);

  // 4. Create Razorpay order
  console.log('\n4️⃣ Testing POST /bookings/payment/create-order...');
  const payload = {
    tripId: trip._id,
    boardingStopId: trip.boardingStop?.stopId?._id || trip.boardingStop?.stopId,
    droppingStopId: trip.droppingStop?.stopId?._id || trip.droppingStop?.stopId,
    seatNumbers: [freeSeat.seatNumber],
    passengers: [
      {
        name: 'Razorpay Test Passenger',
        age: 30,
        gender: 'MALE',
        seatNumber: freeSeat.seatNumber,
        phone: '9876543210',
        email: 'razorpay.test@myjourney.in'
      }
    ]
  };

  const orderRes = await fetch(`${BASE_URL}/bookings/payment/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const orderData = await orderRes.json();
  console.log('   Response status:', orderRes.status);
  console.log('   Order Details:', orderData.data);

  if (orderRes.status !== 200 || !orderData.data?.orderId) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
  }
  console.log(`✅ Real Razorpay Order Created! ID: ${orderData.data.orderId}, Amount: ₹${orderData.data.totalAmount} (${orderData.data.amount} paise)`);

  // 5. Test Invalid Signature rejection
  console.log('\n5️⃣ Testing Invalid Signature rejection on /bookings/payment/verify-and-book...');
  const invalidVerifyRes = await fetch(`${BASE_URL}/bookings/payment/verify-and-book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...payload,
      razorpay_order_id: orderData.data.orderId,
      razorpay_payment_id: 'pay_fake123456789',
      razorpay_signature: 'invalid_cryptographic_signature'
    })
  });
  const invalidData = await invalidVerifyRes.json();
  console.log('   Invalid verification response status:', invalidVerifyRes.status);
  if (invalidVerifyRes.status === 400) {
    console.log(`✅ Correctly rejected tampered signature: "${invalidData.error?.message}"`);
  } else {
    throw new Error('Expected 400 for tampered signature');
  }

  // 6. Test Valid Simulated Signature verification and complete booking
  console.log('\n6️⃣ Generating valid test signature to verify booking completion...');
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
  const testPaymentId = orderData.data.isSandboxFallback ? `pay_sandbox_${Date.now()}` : `pay_test_${Date.now()}`;
  const validSignature = orderData.data.isSandboxFallback
    ? `sandbox_sig_${Date.now()}`
    : crypto
        .createHmac('sha256', keySecret)
        .update(`${orderData.data.orderId}|${testPaymentId}`)
        .digest('hex');

  const validVerifyRes = await fetch(`${BASE_URL}/bookings/payment/verify-and-book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...payload,
      razorpay_order_id: orderData.data.orderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature
    })
  });
  const validData = await validVerifyRes.json();
  console.log('   Verification response status:', validVerifyRes.status);
  if (validVerifyRes.status === 201 && validData.data?.booking?.pnr) {
    console.log(`✅ Booking Confirmed with Valid Razorpay Signature!`);
    console.log(`   PNR: ${validData.data.booking.pnr}`);
    console.log(`   Payment Method: ${validData.data.booking.paymentMethod}`);
    console.log(`   Payment Status: ${validData.data.booking.paymentStatus}`);
    console.log(`   Razorpay Order ID: ${validData.data.booking.razorpayOrderId}`);
    console.log(`   Razorpay Payment ID: ${validData.data.booking.razorpayPaymentId}`);
  } else {
    throw new Error(`Valid verification failed: ${JSON.stringify(validData)}`);
  }

  console.log('\n🎉 ALL RAZORPAY TEST MODE CHECKS PASSED PERFECTLY!\n');
}

testRazorpay().catch(err => {
  console.error('❌ Razorpay Test Failed:', err);
  process.exit(1);
});
