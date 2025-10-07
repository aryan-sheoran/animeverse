// Script to verify and add username fields to existing users
// Run this to migrate existing users to support the username plugin

import { client } from "../db/index";

async function migrateUsersToUsername() {
    try {
        console.log("🔄 Starting user migration for username plugin...");
        
        const usersCollection = client.collection("user");
        
        // Find all users without username field
        const usersWithoutUsername = await usersCollection.find({
            username: { $exists: false }
        }).toArray();
        
        console.log(`Found ${usersWithoutUsername.length} users without username field`);
        
        for (const user of usersWithoutUsername) {
            // Use 'name' field as username if it exists, otherwise use email prefix
            const username = user.name || user.email?.split('@')[0] || `user_${user._id}`;
            const displayUsername = username; // Preserve original case
            
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        username: username.toLowerCase(), // Normalized
                        displayUsername: displayUsername, // Original case
                        updatedAt: new Date()
                    }
                }
            );
            
            console.log(`✅ Updated user ${user.email} with username: ${username}`);
        }
        
        // Verify all users now have username
        const totalUsers = await usersCollection.countDocuments();
        const usersWithUsername = await usersCollection.countDocuments({
            username: { $exists: true }
        });
        
        console.log(`\n📊 Migration Summary:`);
        console.log(`   Total users: ${totalUsers}`);
        console.log(`   Users with username: ${usersWithUsername}`);
        console.log(`   Migration complete! ✅\n`);
        
        // Show sample users
        const sampleUsers = await usersCollection.find({}).limit(3).toArray();
        console.log("Sample users:");
        sampleUsers.forEach((user: any) => {
            console.log(`   - ${user.email}: username="${user.username}", displayUsername="${user.displayUsername}"`);
        });
        
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

// Run migration
migrateUsersToUsername()
    .then(() => {
        console.log("\n✅ Migration completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    });
