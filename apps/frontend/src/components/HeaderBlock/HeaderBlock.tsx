import React from 'react';
import styles from "./css/HeaderBlock.module.css";
import { Link } from 'react-router-dom';

interface HeaderBlockProps {
  className?: string;
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ className }) => {
  return (
    <header className={`${styles.headerBlock} ${className || ''}`.trim()}>
      <Link className={styles.a1} to="../profile">Profile</Link>
      <Link className={styles.a1} to="../subscriptions">Subscriptions</Link>
      <Link className={styles.btn} to="/">Log out</Link>
    </header>
  );
};

export default HeaderBlock;
