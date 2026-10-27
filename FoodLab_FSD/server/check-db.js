import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodlab';

async function check() {
  console.log('====================================================');
  console.log('🍃 CONNECTING TO MONGODB DATABASE...');
  console.log('URI:', URI);
  console.log('====================================================');

  try {
    await mongoose.connect(URI);
    console.log('✅ STATUS: SUCCESSFULLY CONNECTED TO LIVE MONGODB!\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`📁 Database Name: "${db.databaseName}"`);
    console.log(`📊 Active Collections Found (${collections.length}):`);

    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`   - ${c.name.padEnd(12)} : ${count} documents`);
    }

    console.log('\n🔍 Sample Batch Records in MongoDB:');
    const recentBatches = await db.collection('batches').find({}).sort({ createdAt: -1 }).limit(4).toArray();
    recentBatches.forEach((b, i) => {
      console.log(`   ${i + 1}. [${b.batchCode}] ${b.productName} — ${b.batchSize || ''} ${b.unit || ''} (Status: ${b.status})`);
    });

    console.log('====================================================');
    console.log('🎉 Your FoodLab application is 100% connected to MongoDB!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
