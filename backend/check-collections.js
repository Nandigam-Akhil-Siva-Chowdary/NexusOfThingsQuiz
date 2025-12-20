// check-collections.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Available Collections:');
    collections.forEach(col => console.log(`  • ${col.name}`));
    
    // Check participant-related collections
    const participantCollections = collections.filter(c => 
        c.name.toLowerCase().includes('participant') || 
        c.name.toLowerCase().includes('event')
    );
    
    console.log('\n🔍 Participant-related Collections:');
    participantCollections.forEach(col => {
        console.log(`  • ${col.name}`);
    });
    
    // Check sample data from each collection
    for (const col of participantCollections) {
        try {
            const sample = await mongoose.connection.db.collection(col.name).findOne({});
            console.log(`\n📊 Sample from "${col.name}":`);
            console.log(JSON.stringify(sample, null, 2).substring(0, 500) + '...');
            
            // Check for email field
            if (sample && sample.email) {
                console.log(`✅ Has email field: ${sample.email}`);
            } else {
                console.log(`❌ No email field found`);
            }
        } catch (err) {
            console.log(`⚠️ Could not read from ${col.name}: ${err.message}`);
        }
    }
    
    await mongoose.disconnect();
}

checkCollections();