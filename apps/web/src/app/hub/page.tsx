"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();

	const handleLogout = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-[#0f1729] relative">
			{/* Background decorative circles */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
			</div>

			{/* Navbar */}
			<nav className="relative bg-[#1a2332]/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-2xl font-bold text-white tracking-wide">
							Welcome to Your Animeverse
						</h1>
						<button
							onClick={handleLogout}
							className="px-6 py-2 bg-red-600/90 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/30 backdrop-blur-sm"
						>
							Logout
						</button>
					</div>
				</div>
			</nav>

			{/* Content */}
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
					{/* Card 1: AnimeDB */}
					<div className="group bg-[#1e2939]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/30">
						<div className="relative h-64 overflow-hidden">
							<img
								src="/assets/Home-image/Zom100.png"
								alt="AnimeDB"
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-[#1e2939] via-[#1e2939]/50 to-transparent"></div>
						</div>
						<div className="p-8 text-center">
							<h2 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
								AnimeDB
							</h2>
							<p className="text-gray-400 text-sm leading-relaxed">
								Explore your anime database and discover new favorites
							</p>
						</div>
					</div>

					{/* Card 2: More Features Coming Soon with fading image */}
					<div className="group bg-[#1e2939]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/30 relative">
						<div className="relative h-full min-h-[400px]">
							{/* Background image with gradient fade from top to bottom */}
							<div className="absolute inset-0">
								<img
									src="/assets/Home-image/AOT.jpg"
									alt="Coming Soon"
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
								/>
								{/* Gradient overlay that fades the image from visible at top to invisible at bottom */}
								<div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1e2939]/70 to-[#1e2939]"></div>
							</div>
							{/* Content overlay */}
							<div className="relative p-8 text-center flex flex-col justify-end h-full">
								<div className="mb-6">
									<div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300">
										<svg
											className="w-10 h-10 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 4v16m8-8H4"
											/>
										</svg>
									</div>
								</div>
								<h2 className="text-3xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
									More Features Coming Soon
								</h2>
								<p className="text-gray-400 text-sm leading-relaxed">
									Stay tuned for exciting new updates and features
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}