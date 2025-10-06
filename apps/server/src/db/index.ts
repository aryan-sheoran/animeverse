import mongoose from "mongoose";

const connectDB = async () => {
	try {
		if (mongoose.connection.readyState === 0) {
			const dbUrl = process.env.DATABASE_URL || "";
			if (!dbUrl) {
				console.error("❌ DATABASE_URL is not defined in environment variables");
				throw new Error("DATABASE_URL is not defined");
			}
			
			console.log("🔄 Connecting to MongoDB...");
			
			// Extract database name from connection string or use default
			const url = new URL(dbUrl);
			const dbName = url.searchParams.get('dbName') || 'myDB';
			
			await mongoose.connect(dbUrl, {
				dbName: dbName,
				serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
			});
			
			console.log(`✅ Connected to MongoDB database: ${dbName}`);
			console.log(`✅ Connection state: ${mongoose.connection.readyState}`);
		} else {
			console.log(`✅ Already connected to MongoDB (state: ${mongoose.connection.readyState})`);
		}
	} catch (error: any) {
		console.error("❌ Error connecting to database:", error);
		console.error("❌ Error message:", error?.message);
		console.error("❌ DATABASE_URL exists:", !!process.env.DATABASE_URL);
		throw error;
	}
};

// Initialize connection
await connectDB();

const client = mongoose.connection.getClient().db("myDB");

export { client, connectDB };
