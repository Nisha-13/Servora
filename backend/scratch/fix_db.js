import mongoose from 'mongoose';
import { config } from '../src/config/environment.js';
import { Service } from '../src/models/Service.js';
import { Favorite } from '../src/models/Favorite.js';

async function run() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // 1. Update oil change image
    const updated = await Service.updateMany(
      { name: /Synthetic Oil Change/i },
      { $set: { images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop'] } }
    );
    console.log(`Updated oil change service image in ${updated.modifiedCount} documents`);

    // 2. Drop any legacy indexes on favorites collection
    try {
      const indexes = await Favorite.collection.indexes();
      console.log('Current Favorite indexes:', indexes.map(i => i.name));
      for (const idx of indexes) {
        if (idx.name === 'customer_1' || idx.name === 'customer_1_provider_1') {
          try {
            await Favorite.collection.dropIndex(idx.name);
            console.log(`Dropped index: ${idx.name}`);
          } catch (e) {
            console.log(`Could not drop ${idx.name}:`, e.message);
          }
        }
      }
      await Favorite.syncIndexes();
      console.log('Synced Favorite indexes successfully');
    } catch (e) {
      console.warn('Favorite index operation:', e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

run();
