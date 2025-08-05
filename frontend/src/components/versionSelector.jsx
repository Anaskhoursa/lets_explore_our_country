import React, { useState, useEffect } from 'react';
import './VersionSelector.css';

const VersionSelector = () => {
  const [version, setVersion] = useState(localStorage.getItem('version') || '');

  const handleSelect = (ver) => {
    localStorage.setItem('version', ver);
    setVersion(ver);
  };

  return (
    <div className="version-selector">
      <h3 style={{color:'black'}}>Choose Version:</h3>
      <div className="version-buttons">
        <button
          className={version === 'V1' ? 'active' : ''}
          onClick={() => handleSelect('V1')}
        >
          V1
        </button>
        <button
          className={version === 'V2' ? 'active' : ''}
          onClick={() => handleSelect('V2')}
        >
          V2
        </button>
      </div>
      {version && <p style={{color:'black'}}>Current Version: <strong>{version}</strong></p>}
    </div>
  );
};

export default VersionSelector;
