import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const seasonSchema = new mongoose.Schema({
	seasonNumber: { type: Number, required: true },
	title: { type: String },
	description: { type: String },
	episodes: { type: Number, default: 0 },
	imageUrl: { type: String },
	releaseYear: { type: Number }
}, { _id: false });

const showSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true },
		description: { type: String, required: true },
		genres: [{ type: String }],
		imageUrl: { type: String },
		coverImageUrl: { type: String },
		episodes: { type: Number, default: 0 },
		seasons: [seasonSchema],
		totalSeasons: { type: Number, default: 1 },
	},
	{ 
		timestamps: true,
		collection: "show" 
	}
);

const Show = mongoose.model("Show", showSchema);

async function testConnection() {
	try {
		const dbUrl = process.env.DATABASE_URL;
		console.log('📡 Connecting to MongoDB...');
		console.log('Database URL:', dbUrl ? 'Set ✅' : 'Not set ❌');
		
		if (!dbUrl) {
			throw new Error('DATABASE_URL is not defined');
		}

		await mongoose.connect(dbUrl, {
			dbName: 'myDB',
		});

		console.log('✅ Connected to MongoDB database: myDB');
		
		// Test find operation
		console.log('\n📊 Testing Show.find()...');
		const shows = await Show.find().lean();
		console.log(`✅ Found ${shows.length} shows`);
		
		if (shows.length > 0) {
			console.log('\n📋 Sample show:');
			console.log(JSON.stringify(shows[0], null, 2));
		} else {
			console.log('⚠️  No shows found in database');
		}

		await mongoose.connection.close();
		console.log('\n👋 Connection closed');
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	}
}

testConnection();
