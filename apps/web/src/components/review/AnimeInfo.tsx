import React from 'react';
import styles from './AnimeInfo.module.css';

interface AnimeInfoProps {
  animeData: {
    title?: string;
    image?: string;
    info?: string;
    seasons?: Array<{
      seasonNumber: number;
      title: string;
      episodes: number;
      status?: string;
    }>;
  };
  selectedSeason: string;
  setSelectedSeason: (value: string) => void;
  selectedEpisode: string;
  setSelectedEpisode: (value: string) => void;
}

const AnimeInfo: React.FC<AnimeInfoProps> = ({ 
  animeData, 
  selectedSeason, 
  setSelectedSeason, 
  selectedEpisode, 
  setSelectedEpisode 
}) => {
  const title = animeData?.title || 'Unknown Anime';
  const image = animeData?.image;
  const info = animeData?.info || '';

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
    setSelectedEpisode(''); // Reset episode on season change
  };

  const currentSeason = animeData?.seasons?.find(s => s.seasonNumber == parseInt(selectedSeason));
  const episodeCount = currentSeason?.episodes || 0;

  return (
    <div className={styles.animeInfoContainer}>
      {/* Anime Poster */}
      <div className={styles.animePoster}>
        {image ? (
          <img
            src={image}
            alt={`${title} Poster`}
            className={styles.animeImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <i className="fas fa-image"></i>
            <span>No Image Available</span>
          </div>
        )}
        <div className={styles.glassOverlay}></div>
      </div>

      {/* Anime Title and Description */}
      <div className={styles.animeDetails}>
        <h1 className={styles.animeTitle}>{title}</h1>
        <p className={styles.animeInfo}>{info}</p>
      </div>

      {/* Season and Episode Selection */}
      <div className={styles.selectionSection}>
        <h3 className={styles.selectionTitle}>Select Season & Episode</h3>
        
        <div className={styles.selectionControls}>
          <div className={styles.selectWrapper}>
            <label htmlFor="season-select" className={styles.selectLabel}>Season</label>
            <select 
              id="season-select"
              className={styles.selectDropdown}
              value={selectedSeason} 
              onChange={handleSeasonChange}
            >
              <option value="" disabled>Select Season</option>
              {animeData?.seasons?.map(season => (
                <option key={season.seasonNumber} value={season.seasonNumber}>
                  Season {season.seasonNumber}: {season.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label htmlFor="episode-select" className={styles.selectLabel}>Episode</label>
            <select 
              id="episode-select"
              className={styles.selectDropdown}
              value={selectedEpisode} 
              onChange={(e) => setSelectedEpisode(e.target.value)}
              disabled={!selectedSeason}
            >
              <option value="" disabled>Select Episode</option>
              {episodeCount > 0 &&
                [...Array(episodeCount).keys()].map(e => (
                  <option key={e + 1} value={e + 1}>
                    Episode {e + 1}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedSeason && selectedEpisode && (
          <div className={styles.selectionSummary}>
            <div className={styles.summaryIcon}>
              <i className="fas fa-play-circle"></i>
            </div>
            <div className={styles.summaryText}>
              <span className={styles.summaryLabel}>Selected:</span>
              <span className={styles.summaryValue}>
                Season {selectedSeason}, Episode {selectedEpisode}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeInfo;
