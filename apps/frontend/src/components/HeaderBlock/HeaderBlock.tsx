import React from 'react';
import styles from "./css/HeaderBlock.module.css";

interface HeaderBlockProps {
  className?: string;
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ className }) => {
  return (
    <header className={`${styles.headerBlock} ${className || ''}`.trim()}>
      <a className={styles.a1}>Profile</a>
      <a className={styles.a1}>Pricing</a>
    </header>
  );
};

export default HeaderBlock;
