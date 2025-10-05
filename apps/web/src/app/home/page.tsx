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

  // Fetch popular shows from backend (fallback if home_items doesn't have popular section)
  // This will be overridden by home_items data if available
  useEffect(() => {
    let mounted = true;
    const fetchPopular = async () => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
        
        // First try to get popular from home_items
        const homeRes = await fetch(`${serverUrl}/api/home?section=popular`, {
          credentials: 'include',
        });
        
        if (homeRes.ok) {
          const items: HomeItem[] = await homeRes.json();
          if (Array.isArray(items) && items.length > 0) {
            const mapped: PopularShowItem[] = items
              .map((h) => {
                if (!h || !h.show) return null;
                const show = typeof h.show === 'object' ? h.show : null;
                if (!show) return null;
                
                const image = pickImage(show);
                if (!image) return null;
                
                return {
                  id: h._id,
                  showId: getShowId(show),
                  image,
                  title: show.title || 'Untitled',
                  description: show.description || '',
                  type: (show.genres && show.genres.length ? show.genres[0] : 'Unknown')
                };
              })
              .filter((item): item is PopularShowItem => item !== null);
            
            if (mounted && mapped.length > 0) {
              setPopularShows(mapped);
              return; // Don't fetch from shows API if we got data from home_items
            }
          }
        }
        
        // Fallback: fetch from regular shows API
        const res = await fetch(`${serverUrl}/api/shows`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          console.warn('Shows API not available yet');
          return;
        }
        
        let shows: Show[] = await res.json();
        
        // Ensure shows is an array
        if (!Array.isArray(shows)) {
          console.warn('Shows API returned non-array data:', shows);
          shows = [];
        }
        
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

  // Fetch hero and featured items from backend
  useEffect(() => {
    let mounted = true;
    const fetchHomeItems = async () => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
        
        // Helper to map home items to display format
        const mapItems = (items: HomeItem[], sectionName: string): MappedItem[] => {
          if (!Array.isArray(items)) {
            console.warn(`${sectionName} returned non-array data:`, items);
            return [];
          }
          
          return items
            .map(h => {
              if (!h || !h.show) {
                console.warn(`Invalid ${sectionName} item:`, h);
                return null;
              }
              const show = typeof h.show === 'object' ? h.show : null;
              if (!show) {
                console.warn(`Show not populated in ${sectionName}:`, h.show);
                return null;
              }
              
              const image = pickImage(show);
              if (!image) {
                console.warn(`No image for show in ${sectionName}:`, show.title);
                return null;
              }
              
              return {
                id: h._id,
                homeId: h._id,
                showId: getShowId(show),
                title: show.title || 'Untitled',
                description: show.description || '',
                image,
                genres: show.genres || []
              };
            })
            .filter((item): item is MappedItem => item !== null);
        };

        // Fetch hero section
        const heroRes = await fetch(`${serverUrl}/api/home?section=hero`, {
          credentials: 'include',
        });
        
        if (heroRes.ok) {
          const heroItems: HomeItem[] = await heroRes.json();
          console.log('Hero items fetched:', heroItems);
          const mappedHero = mapItems(heroItems, 'hero');
          console.log('Mapped hero items:', mappedHero);
          if (mounted) {
            setHeroData(mappedHero);
          }
        } else {
          console.warn('Hero API not available');
        }

        // Fetch featured section
        const featuredRes = await fetch(`${serverUrl}/api/home?section=featured`, {
          credentials: 'include',
        });
        
        if (featuredRes.ok) {
          const featuredItems: HomeItem[] = await featuredRes.json();
          console.log('Featured items fetched:', featuredItems);
          const mappedFeatured = mapItems(featuredItems, 'featured');
          console.log('Mapped featured items:', mappedFeatured);
          if (mounted) {
            setFeaturedAnimes(mappedFeatured);
          }
        } else {
          console.warn('Featured API not available');
        }

      } catch (err) {
        console.error('Failed to fetch home items:', err);
      }
    };

    fetchHomeItems();
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
