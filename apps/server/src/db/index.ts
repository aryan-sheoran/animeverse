import mongoose from "mongoose";

const connectDB = async () => {
	if (mongoose.connection.readyState === 0) {
		try {
			const dbUrl = process.env.DATABASE_URL || "";
			if (!dbUrl) {
				throw new Error("DATABASE_URL is not defined");
			}
			
			// Extract database name from connection string or use default
			const url = new URL(dbUrl);
			const dbName = url.searchParams.get('dbName') || 'myDB';
			
			await mongoose.connect(dbUrl, {
				dbName: dbName,
			});
			
			console.log(`✅ Connected to MongoDB database: ${dbName}`);
		} catch (error) {
			console.error("❌ Error connecting to database:", error);
			throw error;
		}
	}
};

// Initialize connection
await connectDB();

const client = mongoose.connection.getClient().db("myDB");

export { client, connectDB };
