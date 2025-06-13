import React, { useEffect, useRef, useState } from 'react';

const BulletproofLeafletMap = ({ compact = false, height = 600 }) => {
  const mapRef = useRef(null);
  const [status, setStatus] = useState('Pornire...');
  const [producers, setProducers] = useState([]);
  const initRef = useRef(false);

  useEffect(() => {
    const initMap = async () => {
      // Previne inițializări multiple
      if (initRef.current) return;
      initRef.current = true;

      try {
        setStatus('Verificare container...');
        
        if (!mapRef.current) {
          setStatus('ERROR: Container lipsește');
          return;
        }

        // Curăță containerul complet
        mapRef.current.innerHTML = '';

        setStatus('Obținere producători reali...');

        // ✅ FOLOSEȘTE NOUL ENDPOINT PENTRU PRODUCĂTORI REALI
        let producersData = [];
        try {
          const token = localStorage.getItem('token');
          const headers = { 'Content-Type': 'application/json' };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch('/api/map/producers', { headers });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            producersData = data.producers;
            setProducers(producersData);
          } else {
            throw new Error(data.error || 'Nu s-au putut încărca datele');
          }
          
        } catch (error) {
          setStatus(`ERROR: Nu pot obține datele - ${error.message}`);
          return;
        }

        if (producersData.length === 0) {
          setStatus('GATA: Nu există producători înregistrați');
          return;
        }

        setStatus(`Încărcare Leaflet pentru ${producersData.length} producători...`);

        // Forțează încărcarea Leaflet CSS
        let cssLoaded = false;
        const existingCss = document.querySelector('link[href*="leaflet.css"]');
        
        if (!existingCss) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.onload = () => { cssLoaded = true; };
          document.head.appendChild(link);
          
          // Așteaptă CSS
          let attempts = 0;
          while (!cssLoaded && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }

        // Forțează încărcarea Leaflet JS
        if (!window.L) {
          setStatus('Descărcare librărie Leaflet...');
          
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          document.head.appendChild(script);
          
          // Așteaptă JS să se încarce
          let jsLoaded = false;
          script.onload = () => { jsLoaded = true; };
          
          let attempts = 0;
          while (!jsLoaded && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!window.L) {
            setStatus('ERROR: Leaflet nu s-a încărcat');
            return;
          }
        }

        setStatus('Creare hartă...');

        // CLEANUP forțat înainte de creare
        if (mapRef.current._leaflet_id) {
          delete mapRef.current._leaflet_id;
        }

        // Curăță din nou containerul
        mapRef.current.innerHTML = '';

        // Creează harta cu delay pentru siguranță
        await new Promise(resolve => setTimeout(resolve, 200));

        const map = window.L.map(mapRef.current, {
          zoomControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true
        }).setView([45.9432, 24.9668], 7);

        // Adaugă controlul de zoom
        window.L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        // Adaugă tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
          minZoom: 5
        }).addTo(map);

        setStatus('Adăugare markeri...');

        // ✅ ADAUGĂ MARKERI CU DATELE REALE
        const markers = [];
        producersData.forEach(producer => {
          if (!producer.coordinates || producer.coordinates.length !== 2) {
            console.warn(`Coordonate lipsă pentru ${producer.name}`);
            return;
          }

          // Creează conținutul popup-ului
          const categoriesHtml = producer.categories && producer.categories.length > 0 
            ? `
              <div style="margin: 8px 0;">
                <strong>🏷️ Categorii:</strong><br>
                ${producer.categories.map(cat => `<span style="background: #e3f2fd; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin: 2px;">${cat}</span>`).join(' ')}
              </div>
            `
            : '';

          const locationHtml = producer.fullLocation 
            ? `<p style="margin: 4px 0; font-size: 14px;"><strong>📍</strong> ${producer.fullLocation}</p>`
            : '';

          const phoneHtml = producer.phone 
            ? `<p style="margin: 4px 0; font-size: 14px;"><strong>📞</strong> ${producer.phone}</p>`
            : '';

          const popupContent = `
            <div style="padding: 10px; max-width: 280px; font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 16px; font-weight: bold;">
                ${producer.name}
              </h3>
              
              ${locationHtml}
              ${phoneHtml}
              
              <p style="margin: 6px 0; font-size: 14px;">
                <strong>🛒</strong> ${producer.productCount} produse disponibile
              </p>
              
              ${categoriesHtml}
              
              <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="window.handleViewProfile('${producer.id}')" style="
                  background: linear-gradient(135deg, #4CAF50, #45a049); 
                  color: white; 
                  border: none; 
                  padding: 8px 12px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 12px;
                  font-weight: 600;
                  flex: 1;
                  min-width: 100px;
                ">
                  Vezi profilul
                </button>
                
                <button onclick="window.handleViewProducts('${producer.id}')" style="
                  background: linear-gradient(135deg, #2196F3, #1976D2); 
                  color: white; 
                  border: none; 
                  padding: 8px 12px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 12px;
                  font-weight: 600;
                  flex: 1;
                  min-width: 100px;
                ">
                  Vezi produsele
                </button>
              </div>
            </div>
          `;
          
          const marker = window.L.marker(producer.coordinates)
            .addTo(map)
            .bindPopup(popupContent);
          
          markers.push(marker);
        });

        // Definește funcțiile globale pentru butoane
        window.handleViewProfile = (producerId) => {
          window.location.href = `/profile/${producerId}`;
        };

        window.handleViewProducts = (producerId) => {
          window.location.href = `/products?producer=${producerId}`;
        };

        // Ajustează view pentru toți markerii
        if (markers.length > 1) {
          const group = new window.L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.1));
        } else if (markers.length === 1) {
          map.setView(producersData[0].coordinates, 10);
        }

        setStatus(`SUCCES: Hartă cu ${markers.length} producători!`);

      } catch (error) {
        console.error('Map error:', error);
        setStatus(`ERROR: ${error.message}`);
      }
    };

    // Start inițializare cu delay
    const timeoutId = setTimeout(initMap, 300);

    return () => {
      clearTimeout(timeoutId);
      initRef.current = false;
    };
  }, []);

  const isLoading = status.includes('Pornire') || status.includes('Verificare') || status.includes('Obținere') || status.includes('Încărcare') || status.includes('Creare') || status.includes('Adăugare');
  const isError = status.includes('ERROR');
  const isSuccess = status.includes('SUCCES') || status.includes('GATA');

  return (
    <div style={{ 
      position: 'relative', 
      height: `${height}px`, 
      minHeight: `${height}px`,
      maxHeight: `${height}px`,
      borderRadius: '8px', 
      overflow: 'hidden',
      width: '100%'
    }}>
      {/* Status bar */}
      {!isSuccess && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          zIndex: 1000,
          background: isError ? '#f8d7da' : isLoading ? '#d1ecf1' : '#d4edda',
          color: isError ? '#721c24' : isLoading ? '#0c5460' : '#155724',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          border: `1px solid ${isError ? '#f5c6cb' : isLoading ? '#bee5eb' : '#c3e6cb'}`
        }}>
          {isLoading && (
            <div style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '8px',
              verticalAlign: 'middle'
            }}></div>
          )}
          {status}
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      )}

      {/* Overlay pentru modul compact */}
      {compact && isSuccess && (
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          right: '15px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '16px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>
              Producătorii noștri
            </h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
              {producers.length} producători înregistrați din România
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/products'}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Vezi toate produsele
          </button>
        </div>
      )}

      {/* Container hartă */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: `${height}px`,
          minHeight: `${height}px`,
          maxHeight: `${height}px`,
          background: '#f8f9fa',
          borderRadius: '8px'
        }} 
      />
    </div>
  );
};

export default BulletproofLeafletMap;