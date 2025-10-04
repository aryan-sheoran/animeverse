import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <h2 className={styles.sectionTitle}>
      <i className="fas fa-edit"></i> LEAVE A REVIEW
    </h2>
  );
};

export default Header;
