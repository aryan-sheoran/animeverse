'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import { HeroCarousel, PopularShows, FeaturedAnime } from '@/components/home';
import styles from './home.module.css';
import { useAuth } from '@/lib/use-auth';

interface Show {
  _id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  cardImage?: string;
  genres?: string[];
}

interface HomeItem {
  _id: string;
  show: Show | string;
}

interface MappedItem {
  id: string;
  homeId: string;
  showId: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
}

interface PopularShowItem {
  id: string;
  showId: string;
  image: string;
  title: string;
  description: string;
  type: string;
}

const Home = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [popularShows, setPopularShows] = useState<PopularShowItem[]>([]);
  const [heroData, setHeroData] = useState<MappedItem[]>([]);
  const [featuredAnimes, setFeaturedAnimes] = useState<MappedItem[]>([]);

  // Simple helpers
  const asObjectId = (id: any): string => (typeof id === 'string' && /[0-9a-fA-F]{24}/.test(id) ? id.match(/[0-9a-fA-F]{24}/)![0] : '');
  const getShowId = (show: any): string => (show && show._id ? asObjectId(show._id) || show._id : '');
  
  const normalizeImage = (raw: string): string => {
    if (!raw) return '';
    // Accept absolute or root-relative only; ignore plain filenames
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) return raw;
    // If it's only a filename, assume backend serves under /uploads (adjust if different)
    if (!raw.includes('/') && /\.[a-zA-Z0-9]{2,5}$/.test(raw)) return `/uploads/${raw}`;
    return raw;
  };
  
  const pickImage = (entity: any): string => {
    if (!entity) return '';
    const img = entity.coverImageUrl || entity.imageUrl || entity.cardImage || '';
    return normalizeImage(img);
  };

  // Fetch popular shows from backend
  // Note: This requires REST API endpoints to be set up on the server
  // The server should expose GET /api/shows and GET /api/home endpoints
  useEffect(() => {
    let mounted = true;
    const fetchPopular = async () => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
        const res = await fetch(`${serverUrl}/api/shows`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          console.warn('Shows API not available yet');
          return;
        }
        
        const shows: Show[] = await res.json();
        const mapped: PopularShowItem[] = shows.slice(0, 12).map((s) => ({
          id: s._id,
          showId: getShowId(s),
          image: pickImage(s),
          title: s.title || 'Untitled',
          description: s.description || '',
          type: (s.genres && s.genres.length ? s.genres[0] : 'Unknown')
        })).filter(item => item.image && item.title);

        if (mounted) setPopularShows(mapped);
      } catch (err) {
        console.error('Failed to fetch popular shows:', err);
      }
    };

    fetchPopular();
    return () => { mounted = false; };
  }, []);

  // Fetch home items (hero & featured) from backend
  // Note: This requires REST API endpoints to be set up on the server
  useEffect(() => {
    let mounted = true;
    const fetchHome = async () => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
        const res = await fetch(`${serverUrl}/api/home`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          console.warn('Home API not available yet');
          return;
        }
        
        let items: HomeItem[] = await res.json();

        // Collect show IDs needing population (when show is just a string/ObjectId)
        const missingShowIds = items
          .filter(h => h && h.show && typeof h.show === 'string')
          .map(h => h.show as string)
          .slice(0, 20); // cap to avoid over-fetching

        let showCache: Record<string, Show> = {};
        if (missingShowIds.length) {
          await Promise.all(missingShowIds.map(async (id) => {
            if (showCache[id]) return;
            try {
              const r = await fetch(`${serverUrl}/api/shows/${id}`, {
                credentials: 'include',
              });
              if (r.ok) {
                const data = await r.json();
                if (data && data._id) showCache[id] = data;
              }
            } catch (e) {
              // ignore individual failures
            }
          }));
        }

        let mapped = items.map(h => {
          if (!h) return null;
          const show = typeof h.show === 'object' ? h.show : showCache[h.show as string];
          if (!show) return null;
          const image = pickImage(show);
          if (!image) return null;
          return {
            id: h._id,
            homeId: h._id,
            showId: getShowId(show),
            title: show.title || 'Untitled',
            description: show.description || '',
            image,
            genres: show.genres || []
          };
        }).filter((item): item is MappedItem => item !== null);

        // Fallback: if no curated home items, use empty arrays
        if (!mapped.length) {
          if (mounted) {
            setHeroData([]);
            setFeaturedAnimes([]);
          }
          return; 
        }

        const hero = mapped.slice(0, 4).filter((item): item is MappedItem => item !== null);
        let featured = mapped.slice(4, 12).filter((item): item is MappedItem => item !== null);
        if (featured.length < 4) {
          let i = 0;
          while (featured.length < 4 && hero.length) {
            featured.push(hero[i % hero.length]);
            i++;
            if (i > 20) break;
          }
        }
        if (mounted) {
          setHeroData(hero);
          setFeaturedAnimes(featured);
        }
      } catch (err) {
        console.error('Failed to fetch home items:', err);
      }
    };

    fetchHome();
    return () => { mounted = false; };
  }, []);

  const handleImageClick = (image: string, title: string, description = '', showId = '') => {
    // Normalize filename for backward compatibility
    let normalized = '';
    if (image) {
      try {
        const urlObj = new URL(image, window.location.origin);
        normalized = urlObj.pathname.split('/').pop() || '';
      } catch {
        const cleaned = image.replace('/assets/card-images/', '').replace(/^[\/]+/, '');
        normalized = cleaned.split('/').pop() || '';
      }
    }
    const params = new URLSearchParams();
    if (normalized) params.set('image', normalized);
    if (image) params.set('fullImage', image);
    if (title) params.set('title', title);
    if (description) params.set('info', description);
    if (showId && asObjectId(showId)) params.set('showId', asObjectId(showId));
    router.push(`/review?${params.toString()}`);
  };

  const getDisplayName = () => {
    if (isAuthenticated && user) {
      return user.name || user.email || 'User';
    }
    return 'Guest';
  };

  return (
    <div className={styles.homeRoot}>
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.main}>
          {/* Welcome Section */}
          <div className={styles.welcomeBanner}>
            <h1>Welcome, {getDisplayName()}!</h1>
            <p>Your journey into the world of anime continues here.</p>
          </div>

          <HeroCarousel heroData={heroData} onImageClick={handleImageClick} />
          <PopularShows popularShows={popularShows} onImageClick={handleImageClick} />
          <FeaturedAnime featuredAnimes={featuredAnimes} onImageClick={handleImageClick} />
        </div>
      </div>
    </div>
  );
};

export default Home;
