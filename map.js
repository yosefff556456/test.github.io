document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    const map = L.map('map', {
        center: [24.7136, 46.6753],
        zoom: 6,
        minZoom: 5,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: false
    });

    // Set map bounds for Saudi Arabia
    const bounds = L.latLngBounds(
        [16.3478, 34.4957],  // Southwest corner
        [32.1543, 55.6666]   // Northeast corner
    );
    map.setMaxBounds(bounds);

    // Add custom map tiles without labels
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 10,
        minZoom: 5,
        noWrap: true
    }).addTo(map);

    // Load and process the data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Store markers, labels and polygons
            const cityElements = [];
            const regionElements = [];
            const polygons = [];

            // Add regions (polygons)
            data.regions.forEach(region => {
                const polygon = L.polygon(region.coords, {
                    color: '#ffffff',
                    weight: 2,
                    opacity: 0.8,
                    fill: false
                }).addTo(map);
                
                const label = L.marker(region.labelCoords, {
                    icon: L.divIcon({
                        className: 'region-label',
                        html: region.name
                    })
                }).addTo(map);

                polygons.push(polygon);
                regionElements.push(label);
            });

            // Function to create city marker with label
            function createCityMarker(city, isImportant) {
                const markerClass = isImportant ? 'important-city-marker' : 'city-marker';
                const markerSize = isImportant ? 10 : 8;
                
                const marker = L.marker(city.coords, {
                    icon: L.divIcon({
                        className: 'marker-container',
                        html: `
                            <div class="${markerClass}"></div>
                            <div class="city-label">${city.name}</div>
                        `,
                        iconSize: [100, 40],
                        iconAnchor: [50, 0]
                    })
                }).addTo(map);
                
                return marker;
            }

            // Add cities
            data.cities.forEach(city => {
                const marker = createCityMarker(city, false);
                cityElements.push(marker);
            });

            // Add important cities
            data.importantCities.forEach(city => {
                const marker = createCityMarker(city, true);
                cityElements.push(marker);
            });

            // Handle zoom levels for visibility
            map.on('zoomend', () => {
                const currentZoom = map.getZoom();
                
                // Toggle region elements
                regionElements.forEach(element => {
                    if (currentZoom < 7) {
                        element.getElement().style.display = 'block';
                    } else {
                        element.getElement().style.display = 'none';
                    }
                });

                // Toggle city elements
                cityElements.forEach(element => {
                    if (currentZoom >= 7) {
                        element.getElement().style.display = 'block';
                    } else {
                        element.getElement().style.display = 'none';
                    }
                });

                // Update polygon opacity
                polygons.forEach(polygon => {
                    polygon.setStyle({ opacity: currentZoom < 7 ? 0.8 : 0.4 });
                });
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
