import React from 'react';
import logo from "../../assets/logo.png"
import "./css/HeaderBlock.module.css"

const HeaderBlock: React.FC = () => {
  return (
    <header className="headerBlock">
      <img src={logo} className="logo" alt="logo" />
      <div className="search-container">
        <input type="text" className="search-input" placeholder="find people" />
      </div>
    </header>
  );
};

export default HeaderBlock;