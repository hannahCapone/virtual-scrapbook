import React, { useState } from 'react';
import Board from './Board';
import './App.css';

function App() {
  const [shuffleKey, setShuffleKey] = useState(0);

  return (
    <div className="page">
      <header className="header">
        <a className="back" href="https://hannahcapone.github.io/#projects">&larr; hannahcapone.github.io</a>
        <h1>
          My virtual <em>scrapbook</em>
        </h1>
        <p className="note">a collection of scraps from my travels &amp; experiences</p>
        <div className="actions">
          <button type="button" onClick={() => setShuffleKey((k) => k + 1)}>shuffle &#8635;</button>
          <span className="hint">drag scraps around &middot; click one to look closer</span>
        </div>
      </header>

      <main className="paper">
        <Board shuffleKey={shuffleKey} />
      </main>

      <footer className="footer">&copy; 2026 Hannah Capone</footer>
    </div>
  );
}

export default App;
