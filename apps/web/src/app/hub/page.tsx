"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./hub.module.css";

export default function HubPage() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleLogout = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	const handleAnimeDBClick = () => {
		router.push("/home");
	};

	return (
		<div className={styles.hubRoot}>
			{/* Animated Background */}
			<div className={styles.animatedBackground}>
				<div className={styles.starField}></div>
				<div className={`${styles.glowOrb} ${styles.orb1}`}></div>
				<div className={`${styles.glowOrb} ${styles.orb2}`}></div>
				<div className={`${styles.glowOrb} ${styles.orb3}`}></div>
			</div>

			{/* Header */}
			<header className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.logo}>
						<div className={styles.logoText}>
							<h1>Animeverse</h1>
							<p>Where Fandom Becomes Universe</p>
						</div>
					</div>
					<button onClick={handleLogout} className={styles.logoutBtn}>
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Logout
					</button>
				</div>
			</header>

			{/* Hero Section */}
			<section className={styles.heroSection}>
				<h2 className={styles.heroTitle}>
					Welcome to the Multiverse
				</h2>
				<p className={styles.heroSubtitle}>
					💫 From exploring your favorite anime worlds to shaping your own — Animeverse is your gateway to infinite possibilities.
				</p>
			</section>

			{/* Portal Animation */}
			<section className={styles.portalSection}>
				<h3 className={styles.portalText}>✨ Enter the Hub — your Central Dungeon of Dreams.</h3>
				<p className={styles.portalSubtext}>
					A living nexus forged from pure imagination, where every portal opens to a new universe waiting to be explored.
					<br />
					Step through glowing gateways, feel the pulse of countless worlds, and choose your next adventure.
				</p>
			</section>

			{/* Feature Hub */}
			<section className={styles.featureHub}>
				<h2 className={styles.hubTitle}>Here, every portal leads somewhere extraordinary:</h2>

				<div className={styles.featureGrid}>
					{/* AnimeDB Card */}
					<div 
						className={`${styles.featureCard} ${styles.available}`}
						onClick={handleAnimeDBClick}
					>
						<div className={styles.cardImageContainer}>
							<img 
								src="/assets/Home-image/Zom100.png" 
								alt="AnimeDB" 
								className={styles.cardImage}
							/>
							<div className={styles.cardOverlay}>
								<div className={`${styles.featureIcon} ${styles.iconAnimeDB}`}>
									🎥
								</div>
							</div>
						</div>
						<div className={styles.cardContent}>
							<h3 className={styles.featureTitle}>AnimeDB</h3>
							<p className={styles.featureDescription}>
								Discover, rate, and review anime like never before — your personalized universe of opinions and discoveries.
							</p>
							<button className={styles.exploreBtn}>
								Explore Now
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</button>
						</div>
					</div>

					{/* Community Card */}
					<div className={`${styles.featureCard} ${styles.comingSoon}`}>
						<div className={styles.cardImageContainer}>
							<img 
								src="/assets/Home-image/AOT.jpg" 
								alt="Community" 
								className={styles.cardImage}
							/>
							<div className={styles.cardOverlay}>
								<div className={`${styles.featureIcon} ${styles.iconCommunity}`}>
									💬
								</div>
							</div>
						</div>
						<div className={styles.cardContent}>
							<h3 className={styles.featureTitle}>Community</h3>
							<p className={styles.featureDescription}>
								Forge bonds, share stories, and grow with fellow fans across worlds.
							</p>
							<span className={styles.comingSoonBadge}>Coming Soon</span>
						</div>
					</div>

					{/* Otaku Date Card */}
					<div className={`${styles.featureCard} ${styles.comingSoon}`}>
						<div className={styles.cardImageContainer}>
							<img 
								src="/assets/Home-image/lovingYamada.jpg" 
								alt="Otaku Date" 
								className={styles.cardImage}
							/>
							<div className={styles.cardOverlay}>
								<div className={`${styles.featureIcon} ${styles.iconDating}`}>
									💞
								</div>
							</div>
						</div>
						<div className={styles.cardContent}>
							<h3 className={styles.featureTitle}>Otaku Date</h3>
							<p className={styles.featureDescription}>
								Connect with those who share your spark — love, friendship, or adventure among the stars.
							</p>
							<span className={styles.comingSoonBadge}>Coming Soon</span>
						</div>
					</div>
				</div>

				<div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.8' }}>
					<p style={{ marginBottom: '1rem' }}>🚪 Every click is a portal.</p>
					<p style={{ marginBottom: '1rem' }}>🌌 Every world is alive.</p>
					<p style={{ fontWeight: 700, fontSize: '1.25rem', background: 'linear-gradient(90deg, #8a2be2, #2575fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '1.5rem' }}>
						🔥 Welcome to the Hub — welcome to Animeverse, where your fandom becomes a universe.
					</p>
				</div>
			</section>
		</div>
	);
}