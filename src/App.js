import React from 'react';
import './App.css';
import RandomImages from './RandomImages';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Virtual Scrapbook</h1>
        <p>A collection of scraps from all of my travels and experiences.</p>
        <RandomImages />
      </header>
    </div>
  );
}

export default App;