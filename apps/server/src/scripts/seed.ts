import mongoose from "mongoose";
import { Show } from "../db/models/show.model";
import { HomeItem } from "../db/models/home-item.model";

// Seed data
const seedShows = [
	{
		title: "Attack on Titan",
		description: "Humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid beings who devour humans.",
		coverImageUrl: "/assets/card-images/aot.jpeg",
		imageUrl: "/assets/card-images/aot.jpeg",
		cardImage: "/assets/card-images/aot.jpeg",
		genres: ["Action", "Dark Fantasy", "Drama"],
		rating: 4.8,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 25,
				status: "Finished",
				description: "The beginning of humanity's fight for survival"
			},
			{
				seasonNumber: 2,
				title: "Season 2",
				episodes: 12,
				status: "Finished",
				description: "The truth starts to unravel"
			},
			{
				seasonNumber: 3,
				title: "Season 3",
				episodes: 22,
				status: "Finished",
				description: "Revolutionary revelations"
			},
			{
				seasonNumber: 4,
				title: "Final Season",
				episodes: 28,
				status: "Finished",
				description: "The final battle for freedom"
			}
		],
		totalEpisodes: 87,
		status: "Completed",
		releaseYear: 2013,
		studio: "MAPPA, Wit Studio",
		tags: ["shounen", "military", "tragedy"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "Demon Slayer",
		description: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon.",
		coverImageUrl: "/assets/card-images/demon.jpeg",
		imageUrl: "/assets/card-images/demon.jpeg",
		cardImage: "/assets/card-images/demon.jpeg",
		genres: ["Action", "Adventure", "Fantasy"],
		rating: 4.7,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 26,
				status: "Finished",
			},
			{
				seasonNumber: 2,
				title: "Entertainment District Arc",
				episodes: 11,
				status: "Finished",
			},
			{
				seasonNumber: 3,
				title: "Swordsmith Village Arc",
				episodes: 11,
				status: "Finished",
			}
		],
		totalEpisodes: 48,
		status: "Ongoing",
		releaseYear: 2019,
		studio: "ufotable",
		tags: ["shounen", "supernatural", "historical"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "Jujutsu Kaisen",
		description: "A boy swallows a cursed talisman and becomes possessed by a powerful curse.",
		coverImageUrl: "/assets/card-images/jjk.jpeg",
		imageUrl: "/assets/card-images/jjk.jpeg",
		cardImage: "/assets/card-images/jjk.jpeg",
		genres: ["Action", "Dark Fantasy", "Supernatural"],
		rating: 4.6,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 24,
				status: "Finished",
			},
			{
				seasonNumber: 2,
				title: "Season 2",
				episodes: 23,
				status: "Finished",
			}
		],
		totalEpisodes: 47,
		status: "Ongoing",
		releaseYear: 2020,
		studio: "MAPPA",
		tags: ["shounen", "supernatural", "school"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "One Piece",
		description: "Monkey D. Luffy and his pirate crew explore a fantastical world of endless oceans and exotic islands.",
		coverImageUrl: "/assets/card-images/one.jpeg",
		imageUrl: "/assets/card-images/one.jpeg",
		cardImage: "/assets/card-images/one.jpeg",
		genres: ["Action", "Adventure", "Comedy"],
		rating: 4.9,
		seasons: [
			{
				seasonNumber: 1,
				title: "East Blue Saga",
				episodes: 61,
				status: "Finished",
			}
		],
		totalEpisodes: 1000,
		status: "Ongoing",
		releaseYear: 1999,
		studio: "Toei Animation",
		tags: ["shounen", "pirates", "adventure"],
		isFeatured: false,
		isPopular: true,
	},
	{
		title: "Naruto",
		description: "Naruto Uzumaki, a young ninja who seeks recognition from his peers and dreams of becoming the Hokage.",
		coverImageUrl: "/assets/card-images/naruto.jpeg",
		imageUrl: "/assets/card-images/naruto.jpeg",
		cardImage: "/assets/card-images/naruto.jpeg",
		genres: ["Action", "Adventure", "Martial Arts"],
		rating: 4.5,
		seasons: [
			{
				seasonNumber: 1,
				title: "Naruto",
				episodes: 220,
				status: "Finished",
			},
			{
				seasonNumber: 2,
				title: "Naruto Shippuden",
				episodes: 500,
				status: "Finished",
			}
		],
		totalEpisodes: 720,
		status: "Completed",
		releaseYear: 2002,
		studio: "Pierrot",
		tags: ["shounen", "ninja", "martial arts"],
		isFeatured: false,
		isPopular: true,
	},
	{
		title: "Hunter x Hunter",
		description: "Gon Freecss aspires to become a Hunter, an exceptional being capable of greatness.",
		coverImageUrl: "/assets/card-images/hunterxhunter.jpeg",
		imageUrl: "/assets/card-images/hunterxhunter.jpeg",
		cardImage: "/assets/card-images/hunterxhunter.jpeg",
		genres: ["Action", "Adventure", "Fantasy"],
		rating: 4.9,
		seasons: [
			{
				seasonNumber: 1,
				title: "Hunter x Hunter (2011)",
				episodes: 148,
				status: "Finished",
			}
		],
		totalEpisodes: 148,
		status: "Hiatus",
		releaseYear: 2011,
		studio: "Madhouse",
		tags: ["shounen", "adventure", "supernatural"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "Death Note",
		description: "A high school student discovers a supernatural notebook that allows him to kill anyone by writing the victim's name.",
		coverImageUrl: "/assets/card-images/death.jpeg",
		imageUrl: "/assets/card-images/death.jpeg",
		cardImage: "/assets/card-images/death.jpeg",
		genres: ["Psychological", "Thriller", "Supernatural"],
		rating: 4.7,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 37,
				status: "Finished",
			}
		],
		totalEpisodes: 37,
		status: "Completed",
		releaseYear: 2006,
		studio: "Madhouse",
		tags: ["psychological", "mystery", "supernatural"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "Black Clover",
		description: "Asta and Yuno were abandoned at the same church on the same day. Raised together as children, they came to know of the Wizard King.",
		coverImageUrl: "/assets/card-images/black-clover.jpeg",
		imageUrl: "/assets/card-images/black-clover.jpeg",
		cardImage: "/assets/card-images/black-clover.jpeg",
		genres: ["Action", "Comedy", "Fantasy"],
		rating: 4.3,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 170,
				status: "Finished",
			}
		],
		totalEpisodes: 170,
		status: "Completed",
		releaseYear: 2017,
		studio: "Pierrot",
		tags: ["shounen", "magic", "action"],
		isFeatured: false,
		isPopular: true,
	},
	{
		title: "Fire Force",
		description: "A young man with the ability to control fire joins a special fire force to stop mysterious human combustion.",
		coverImageUrl: "/assets/card-images/fire.jpeg",
		imageUrl: "/assets/card-images/fire.jpeg",
		cardImage: "/assets/card-images/fire.jpeg",
		genres: ["Action", "Sci-Fi", "Supernatural"],
		rating: 4.2,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 24,
				status: "Finished",
			},
			{
				seasonNumber: 2,
				title: "Season 2",
				episodes: 24,
				status: "Finished",
			}
		],
		totalEpisodes: 48,
		status: "Completed",
		releaseYear: 2019,
		studio: "David Production",
		tags: ["shounen", "supernatural", "action"],
		isFeatured: false,
		isPopular: false,
	},
	{
		title: "Chainsaw Man",
		description: "A young man becomes a devil hunter after merging with his chainsaw dog.",
		coverImageUrl: "/assets/card-images/chainsaw.jpeg",
		imageUrl: "/assets/card-images/chainsaw.jpeg",
		cardImage: "/assets/card-images/chainsaw.jpeg",
		genres: ["Action", "Dark Fantasy", "Horror"],
		rating: 4.6,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 12,
				status: "Finished",
			}
		],
		totalEpisodes: 12,
		status: "Ongoing",
		releaseYear: 2022,
		studio: "MAPPA",
		tags: ["shounen", "horror", "supernatural"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "Solo Leveling",
		description: "In a world where hunters fight monsters, the weakest hunter gains the power to level up.",
		coverImageUrl: "/assets/card-images/solo.jpeg",
		imageUrl: "/assets/card-images/solo.jpeg",
		cardImage: "/assets/card-images/solo.jpeg",
		genres: ["Action", "Fantasy", "Adventure"],
		rating: 4.8,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 12,
				status: "Finished",
			}
		],
		totalEpisodes: 12,
		status: "Ongoing",
		releaseYear: 2024,
		studio: "A-1 Pictures",
		tags: ["action", "fantasy", "leveling"],
		isFeatured: true,
		isPopular: true,
	},
	{
		title: "Tokyo Ghoul",
		description: "A college student is turned into a half-ghoul after a deadly encounter.",
		coverImageUrl: "/assets/card-images/tokyo.jpeg",
		imageUrl: "/assets/card-images/tokyo.jpeg",
		cardImage: "/assets/card-images/tokyo.jpeg",
		genres: ["Action", "Dark Fantasy", "Horror"],
		rating: 4.4,
		seasons: [
			{
				seasonNumber: 1,
				title: "Season 1",
				episodes: 12,
				status: "Finished",
			},
			{
				seasonNumber: 2,
				title: "√A",
				episodes: 12,
				status: "Finished",
			}
		],
		totalEpisodes: 48,
		status: "Completed",
		releaseYear: 2014,
		studio: "Pierrot",
		tags: ["seinen", "horror", "psychological"],
		isFeatured: false,
		isPopular: true,
	},
];

async function seed() {
	try {
		// Connect to database
		await mongoose.connect(process.env.DATABASE_URL || "");
		
		console.log("Connected to database");
		
		// Clear existing data
		await Show.deleteMany({});
		await HomeItem.deleteMany({});
		
		console.log("Cleared existing data");
		
		// Insert shows
		const shows = await Show.insertMany(seedShows);
		console.log(`Inserted ${shows.length} shows`);
		
		// Create home items for featured shows
		const featuredShows = shows.filter((s: any) => s.isFeatured);
		const homeItems: any[] = [];
		
		// Hero section (first 3 featured)
		for (let i = 0; i < Math.min(3, featuredShows.length); i++) {
			homeItems.push({
				show: featuredShows[i]._id,
				section: 'hero',
				order: i,
				isActive: true,
			});
		}
		
		// Featured section (all featured)
		for (let i = 0; i < featuredShows.length; i++) {
			homeItems.push({
				show: featuredShows[i]._id,
				section: 'featured',
				order: i,
				isActive: true,
			});
		}
		
		// Popular section (all popular shows)
		const popularShows = shows.filter((s: any) => s.isPopular);
		for (let i = 0; i < popularShows.length; i++) {
			homeItems.push({
				show: popularShows[i]._id,
				section: 'popular',
				order: i,
				isActive: true,
			});
		}
		
		await HomeItem.insertMany(homeItems);
		console.log(`Inserted ${homeItems.length} home items`);
		
		console.log("Seed completed successfully!");
		
		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seed();
