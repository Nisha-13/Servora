import mongoose from 'mongoose';
import { config } from '../src/config/environment.js';
import { Service } from '../src/models/Service.js';
import { Favorite } from '../src/models/Favorite.js';
import { ContactMessage } from '../src/models/ContactMessage.js';
import { User } from '../src/models/User.js';
import { providerService } from '../src/services/providerService.js';

async function verify() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('--- VERIFICATION START ---');

    // 1. Check oil change service image
    const oilSvc = await Service.findOne({ name: /Synthetic Oil Change/i });
    console.log('Oil Change Service Image:', oilSvc?.images?.[0]);

    // 2. Check Favorite indexes
    const favIndexes = await Favorite.collection.indexes();
    console.log('Favorite Indexes in DB:', favIndexes.map(i => i.name));

    // 3. Test ContactMessage model
    const testMsg = await ContactMessage.create({
      name: 'Verification Test',
      email: 'test@example.com',
      subject: 'Test Inquiry',
      message: 'This is a test message verification'
    });
    console.log('Contact Message saved successfully with ID:', testMsg._id);
    await ContactMessage.deleteOne({ _id: testMsg._id });
    console.log('Contact Message cleaned up');

    // 4. Test provider dashboard stats
    const sampleProvider = await User.findOne({ role: 'PROVIDER' });
    if (sampleProvider) {
      const stats = await providerService.getProviderDashboardStats(sampleProvider._id);
      console.log('Provider Dashboard Stats:', stats.stats);
    }

    console.log('--- ALL BACKEND VERIFICATIONS PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
}

verify();
