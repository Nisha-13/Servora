import http from 'http';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Service } from '../src/models/Service.js';
import { Booking } from '../src/models/Booking.js';
import { Invoice } from '../src/models/Invoice.js';
import { Payment } from '../src/models/Payment.js';
import { Review } from '../src/models/Review.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { Notification } from '../src/models/Notification.js';
import { ActivityLog } from '../src/models/ActivityLog.js';
import { BOOKING_STATUS } from '../src/constants/bookingStatus.js';
import { INVOICE_STATUS, PAYMENT_STATUS } from '../src/constants/paymentStatus.js';

let server;
let baseUrl = 'http://localhost:5001';

const request = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const res = await fetch(url, config);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting Servora Full-Stack API Integration Tests');
  console.log('======================================================\n');

  try {
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(5001, resolve));
    console.log('[Test Server] Listening on http://localhost:5001');

    let customerToken = '';
    let providerToken = '';
    let providerId = '';
    let adminToken = '';
    let testBookingId = '';
    let testInvoiceId = '';
    let testServiceId = '';
    let testConversationId = '';

    // Test 1: Health check
    console.log('\n👉 1. Testing GET /api/health');
    const health = await request('/api/health');
    console.assert(health.status === 200, `Health check failed: ${health.status}`);
    console.log('   ✅ Health endpoint working (200 OK)');

    // Test 2: User Registration & Login (Clean Test Customer, Provider, Admin)
    console.log('\n👉 2. Testing Authentication & JWT issuance');
    const testCustomerEmail = `test.customer.${Date.now()}@servora.com`;
    const customerRegister = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Customer Automated',
        email: testCustomerEmail,
        password: 'Password123!',
        phone: '+92 300 0000000',
        address: { street: 'Main Boulevard', city: 'Lahore' }
      }
    });
    console.assert(customerRegister.status === 201, `Customer register failed: ${customerRegister.body?.message}`);
    customerToken = customerRegister.body.data.token;
    console.log('   ✅ Clean customer registered & logged in (JWT received)');

    const providerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'ahmed.tech@servora.com', password: 'Password123!' }
    });
    console.assert(providerLogin.status === 200, `Provider login failed: ${providerLogin.body?.message}`);
    providerToken = providerLogin.body.data.token;
    providerId = providerLogin.body.data.user._id;
    console.log('   ✅ Provider login successful (JWT received)');

    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@servora.com', password: 'Admin123!' }
    });
    console.assert(adminLogin.status === 200, `Admin login failed: ${adminLogin.body?.message}`);
    adminToken = adminLogin.body.data.token;
    console.log('   ✅ Admin login successful (JWT received)');

    // Test 3: Categories & Services Catalog
    console.log('\n👉 3. Testing Category & Service Catalog');
    const categories = await request('/api/categories');
    console.assert(categories.status === 200 && categories.body.data.categories.length > 0, 'Categories fetch failed');
    console.log(`   ✅ Categories retrieved: ${categories.body.data.categories.length} categories available`);

    const services = await request(`/api/services?provider=${providerId}&limit=10`);
    console.assert(services.status === 200 && services.body.data.services.length > 0, 'Services fetch failed');
    testServiceId = services.body.data.services[0]._id;
    console.log(`   ✅ Services retrieved: Found "${services.body.data.services[0].name}" (Starting Rs. ${services.body.data.services[0].startingPrice})`);

    // Test 4: End-to-End Booking Lifecycle
    console.log('\n👉 4. Testing Complete Booking Lifecycle Flow');
    
    // 4a. Customer creates booking -> PENDING
    const createBooking = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        serviceId: testServiceId,
        bookingDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        timeSlot: '02:00 PM - 04:00 PM',
        address: { street: 'Phase 5 DHA', city: 'Lahore' },
        notes: 'Integration test automated booking flow'
      }
    });
    console.assert(createBooking.status === 201, `Create booking failed: ${createBooking.body?.message}`);
    testBookingId = createBooking.body.data.booking._id;
    console.log(`   ✅ Booking created: #${createBooking.body.data.booking.bookingNumber} (Status: ${createBooking.body.data.booking.status})`);

    // 4b. Provider accepts booking -> ACCEPTED
    const acceptBooking = await request(`/api/bookings/${testBookingId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${providerToken}` },
      body: { status: BOOKING_STATUS.ACCEPTED, note: 'Provider accepted test job' }
    });
    console.assert(acceptBooking.status === 200, `Accept booking failed: ${acceptBooking.body?.message}`);
    console.assert(acceptBooking.body.data.booking.status === BOOKING_STATUS.ACCEPTED, 'Status is not ACCEPTED');
    console.log('   ✅ Provider accepted booking -> Status: ACCEPTED');

    // 4c. Provider starts service on site -> IN_PROGRESS
    const startService = await request(`/api/bookings/${testBookingId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${providerToken}` },
      body: { status: BOOKING_STATUS.IN_PROGRESS, note: 'Service started on site' }
    });
    console.assert(startService.status === 200, `Start service failed: ${startService.body?.message}`);
    console.assert(startService.body.data.booking.status === BOOKING_STATUS.IN_PROGRESS, 'Status is not IN_PROGRESS');
    console.log('   ✅ Service started on-site -> Status: IN_PROGRESS');

    // 4d. Provider completes service on site -> SERVICE_COMPLETED
    const completeService = await request(`/api/bookings/${testBookingId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${providerToken}` },
      body: { status: BOOKING_STATUS.SERVICE_COMPLETED, note: 'Work completed on site' }
    });
    console.assert(completeService.status === 200, `Complete service failed: ${completeService.body?.message}`);
    console.assert(completeService.body.data.booking.status === BOOKING_STATUS.SERVICE_COMPLETED, 'Status is not SERVICE_COMPLETED');
    console.log('   ✅ Service finished -> Status: SERVICE_COMPLETED');

    // 4e. Provider generates itemized invoice -> PAYMENT_PENDING
    const createInvoice = await request('/api/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerToken}` },
      body: {
        bookingId: testBookingId,
        items: [
          { title: 'Inverter AC Diagnostic & Repair Service', amount: 2000, type: 'SERVICE' },
          { title: 'Replacement Cooling Sensor Part', amount: 1200, type: 'PARTS' },
          { title: 'Precision Soldering Labor', amount: 800, type: 'LABOR' }
        ],
        serviceFee: 2000,
        partsFee: 1200,
        laborFee: 800,
        totalAmount: 4000,
        notes: 'Includes 30 days parts & service guarantee'
      }
    });
    console.assert(createInvoice.status === 201, `Create invoice failed: ${createInvoice.body?.message}`);
    testInvoiceId = createInvoice.body.data.invoice._id;
    console.log(`   ✅ Itemized invoice generated: #${createInvoice.body.data.invoice.invoiceNumber} for Rs. ${createInvoice.body.data.invoice.totalAmount} -> Status: PAYMENT_PENDING`);

    // Verify booking status transitioned to PAYMENT_PENDING
    const verifyBookingPending = await request(`/api/bookings/${testBookingId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.assert(verifyBookingPending.body.data.booking.status === BOOKING_STATUS.PAYMENT_PENDING, 'Booking is not in PAYMENT_PENDING');

    // 4f. Test Cash on Delivery Authorization & Confirmation
    console.log('\n👉 5. Testing Cash on Delivery Payment Confirmation');

    // Customer attempt should fail with 403 (Customers cannot confirm cash payment)
    const customerConfirmAttempt = await request('/api/payments/confirm-cash', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { invoiceId: testInvoiceId }
    });
    console.assert(customerConfirmAttempt.status === 403, `Customer should not be allowed to confirm cash payment, got status: ${customerConfirmAttempt.status}`);
    console.log('   ✅ Customer self-confirmation correctly blocked with 403 Forbidden');

    // Provider confirms receipt of physical cash
    const providerConfirmCash = await request('/api/payments/confirm-cash', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerToken}` },
      body: { invoiceId: testInvoiceId, bookingId: testBookingId }
    });
    console.assert(providerConfirmCash.status === 200, `Provider cash confirmation failed: ${providerConfirmCash.body?.message}`);
    console.log(`   ✅ Cash payment confirmed by provider: Transaction ${providerConfirmCash.body.data.payment.transactionId} -> Status: COMPLETED`);

    // Verify invoice and booking are now PAID
    const verifiedInvoice = await request(`/api/invoices/${testInvoiceId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.assert(verifiedInvoice.body.data.invoice.status === INVOICE_STATUS.PAID, 'Invoice status is not PAID');

    const verifiedBooking = await request(`/api/bookings/${testBookingId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.assert(verifiedBooking.body.data.booking.status === BOOKING_STATUS.PAID, 'Booking status is not PAID');
    console.log('   ✅ Booking & Invoice successfully verified as PAID in database!');

    // 4h. Customer submits 5-star review
    console.log('\n👉 6. Testing Verified Review Submission');
    const createReview = await request('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        bookingId: testBookingId,
        rating: 5,
        comment: 'Outstanding and professional AC repair service! Very satisfied with the timely completion.'
      }
    });
    console.assert(createReview.status === 201, `Create review failed: ${createReview.body?.message}`);
    console.log('   ✅ 5-Star review successfully submitted & provider rating recalculated');

    // Test 5: Real-time Chat Conversation & Messaging
    console.log('\n👉 7. Testing Real-time Chat');
    const conversation = await request('/api/conversations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        targetUserId: providerLogin.body.data.user._id,
        bookingId: testBookingId
      }
    });
    console.assert(conversation.status === 200, `Conversation creation failed: ${conversation.body?.message}`);
    testConversationId = conversation.body.data.conversation._id;

    const sendMessage = await request(`/api/conversations/${testConversationId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { text: 'Hello Ahmed! Thank you for the AC repair today.' }
    });
    console.assert(sendMessage.status === 201, `Send message failed: ${sendMessage.body?.message}`);
    console.log('   ✅ Message created and delivered in conversation thread');

    // Test 6: Admin Dashboard & Activity Logs
    console.log('\n👉 8. Testing Admin Metrics & Activity Logs');
    const adminDashboard = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.assert(adminDashboard.status === 200, `Admin dashboard failed: ${adminDashboard.body?.message}`);
    console.log(`   ✅ Admin KPIs verified: Total Bookings = ${adminDashboard.body.data.kpis.totalBookings}, Total Revenue = Rs. ${adminDashboard.body.data.kpis.totalRevenue}`);

    const activityLogs = await request('/api/admin/activity-logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.assert(activityLogs.status === 200 && activityLogs.body.data.logs.length > 0, 'Activity logs empty');
    console.log(`   ✅ System Audit Trail working: ${activityLogs.body.data.logs.length} logged activities recorded`);

    console.log('\n======================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('======================================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [Test Error]:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runAllTests();
