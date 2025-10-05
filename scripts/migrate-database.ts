/**
 * Database Migration Script
 * 
 * This script migrates existing data to match the new model schemas.
 * Run this ONCE before deploying the updated application.
 * 
 * IMPORTANT: 
 * - Backup your database before running this script
 * - Test on a staging environment first
 * - This script is idempotent but should only be run once
 */

import mongoose from 'mongoose';
import { Review } from '../apps/server/src/db/models/review.model';
import { SeasonRating } from '../apps/server/src/db/models/season-rating.model';
import { Show } from '../apps/server/src/db/models/show.model';

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animeverse';
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to 'true' to test without making changes

/**
 * Connect to MongoDB
 */
async function connect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Migrate Reviews
 * - Rename userId → user
 * - Convert showId (ObjectId) → animeId (String), animeTitle, animeImage
 * - Remove: bestMoment, worstMoment, isPublic, likeCount, commentCount, viewCount
 */
async function migrateReviews() {
  console.log('\n📝 Migrating Reviews...');
  
  try {
    // Use native MongoDB driver for this migration since schema has changed
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');
    const reviewsCollection = db.collection('reviews');
    
    // Find all reviews with old schema
    const oldReviews = await reviewsCollection.find({
      $or: [
        { userId: { $exists: true } },
        { showId: { $exists: true } }
      ]
    }).toArray();
    
    console.log(`Found ${oldReviews.length} reviews to migrate`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const review of oldReviews) {
      try {
        const updateData: any = {};
        const unsetData: any = {};
        
        // Rename userId → user
        if (review.userId) {
          updateData.user = review.userId;
          unsetData.userId = '';
        }
        
        // Convert showId to animeId, animeTitle, animeImage
        if (review.showId) {
          // Fetch show data
          const show = await Show.findById(review.showId).lean() as any;
          
          if (show) {
            updateData.animeId = show._id.toString();
            updateData.animeTitle = show.title;
            updateData.animeImage = show.imageUrl || show.coverImageUrl || '';
          } else {
            // If show not found, use showId as animeId
            updateData.animeId = review.showId.toString();
            updateData.animeTitle = 'Unknown Anime';
            updateData.animeImage = '';
            console.warn(`⚠️  Show not found for review ${review._id}, using fallback`);
          }
          
          unsetData.showId = '';
        }
        
        // Remove obsolete fields
        unsetData.bestMoment = '';
        unsetData.worstMoment = '';
        unsetData.isPublic = '';
        unsetData.likeCount = '';
        unsetData.commentCount = '';
        unsetData.viewCount = '';
        
        // Update the document
        if (!DRY_RUN) {
          await reviewsCollection.updateOne(
            { _id: review._id },
            {
              $set: updateData,
              $unset: unsetData
            }
          );
        }
        
        migrated++;
        
        if (migrated % 100 === 0) {
          console.log(`  Processed ${migrated}/${oldReviews.length} reviews...`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate review ${review._id}:`, error);
        failed++;
      }
    }
    
    console.log(`✅ Reviews migration complete: ${migrated} migrated, ${failed} failed`);
    if (DRY_RUN) console.log('  (DRY RUN - no changes made)');
  } catch (error) {
    console.error('❌ Reviews migration failed:', error);
    throw error;
  }
}

/**
 * Migrate Season Ratings
 * - Rename userId → user
 * - Rename showId → show
 * - Rename comment → review
 * - Add default values for new fields: episodesWatched, totalEpisodes
 */
async function migrateSeasonRatings() {
  console.log('\n⭐ Migrating Season Ratings...');
  
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');
    const ratingsCollection = db.collection('season_ratings');
    
    // Find all ratings with old schema
    const oldRatings = await ratingsCollection.find({
      $or: [
        { userId: { $exists: true } },
        { showId: { $exists: true } },
        { comment: { $exists: true } }
      ]
    }).toArray();
    
    console.log(`Found ${oldRatings.length} season ratings to migrate`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const rating of oldRatings) {
      try {
        const updateData: any = {};
        const unsetData: any = {};
        
        // Rename userId → user
        if (rating.userId) {
          updateData.user = rating.userId;
          unsetData.userId = '';
        }
        
        // Rename showId → show
        if (rating.showId) {
          updateData.show = rating.showId;
          unsetData.showId = '';
        }
        
        // Rename comment → review
        if (rating.comment !== undefined) {
          updateData.review = rating.comment || '';
          unsetData.comment = '';
        }
        
        // Add default values for new fields if they don't exist
        if (!rating.seasonTitle) {
          updateData.seasonTitle = `Season ${rating.seasonNumber || 1}`;
        }
        if (rating.episodesWatched === undefined) {
          updateData.episodesWatched = 0;
        }
        if (rating.totalEpisodes === undefined) {
          updateData.totalEpisodes = 0;
        }
        
        // Update the document
        if (!DRY_RUN) {
          await ratingsCollection.updateOne(
            { _id: rating._id },
            {
              $set: updateData,
              $unset: unsetData
            }
          );
        }
        
        migrated++;
        
        if (migrated % 100 === 0) {
          console.log(`  Processed ${migrated}/${oldRatings.length} ratings...`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate rating ${rating._id}:`, error);
        failed++;
      }
    }
    
    console.log(`✅ Season ratings migration complete: ${migrated} migrated, ${failed} failed`);
    if (DRY_RUN) console.log('  (DRY RUN - no changes made)');
  } catch (error) {
    console.error('❌ Season ratings migration failed:', error);
    throw error;
  }
}

/**
 * Clean up Shows
 * - Remove obsolete fields: rating, totalEpisodes, status, releaseYear, etc.
 */
async function cleanupShows() {
  console.log('\n🎬 Cleaning up Shows...');
  
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');
    const showsCollection = db.collection('shows');
    
    const fieldsToRemove = {
      rating: '',
      totalEpisodes: '',
      status: '',
      releaseYear: '',
      studio: '',
      director: '',
      tags: '',
      isFeatured: '',
      isPopular: '',
      viewCount: '',
      createdBy: '',
      cardImage: ''
    };
    
    const result = DRY_RUN 
      ? { matchedCount: await showsCollection.countDocuments() }
      : await showsCollection.updateMany({}, { $unset: fieldsToRemove });
    
    console.log(`✅ Shows cleanup complete: ${result.matchedCount} shows updated`);
    if (DRY_RUN) console.log('  (DRY RUN - no changes made)');
  } catch (error) {
    console.error('❌ Shows cleanup failed:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Database Migration');
  console.log('================================');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Set DRY_RUN=false to apply changes');
  }
  
  console.log(`\nDatabase: ${MONGODB_URI}`);
  console.log('================================\n');
  
  try {
    await connect();
    
    // Run migrations in sequence
    await migrateReviews();
    await migrateSeasonRatings();
    await cleanupShows();
    
    console.log('\n================================');
    console.log('✅ Migration Complete!');
    console.log('================================\n');
    
    if (DRY_RUN) {
      console.log('To apply these changes, run:');
      console.log('DRY_RUN=false npm run migrate\n');
    }
  } catch (error) {
    console.error('\n================================');
    console.error('❌ Migration Failed');
    console.error('================================');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  main();
}

export { migrateReviews, migrateSeasonRatings, cleanupShows };
