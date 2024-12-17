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
            const markers = [];
            const regionLabels = [];
            const regionPolygons = [];

            // Add regions with borders only
            data.regions.forEach(region => {
                // Add region border
                const polygon = L.polygon(region.coords, {
                    color: '#ffffff',
                    weight: 2,
                    opacity: 0.8,
                    fill: false
                }).addTo(map);
                regionPolygons.push(polygon);

                // Add region label
                const label = L.marker(region.labelCoords, {
                    icon: L.divIcon({
                        className: 'region-label',
                        html: region.name
                    })
                }).addTo(map);
                regionLabels.push(label);
            });

            // Add cities with labels
            function createCityMarker(city, isImportant) {
                const markerHtml = `
                    <div class="marker-container">
                        <div class="${isImportant ? 'important-city-marker' : 'city-marker'}"></div>
                        <div class="city-label">${city.name}</div>
                    </div>`;

                return L.marker(city.coords, {
                    icon: L.divIcon({
                        className: '',
                        html: markerHtml,
                        iconSize: [100, 40],
                        iconAnchor: [50, 0]
                    })
                });
            }

            // Add regular cities
            data.cities.forEach(city => {
                const marker = createCityMarker(city, false).addTo(map);
                markers.push(marker);
            });

            // Add important cities
            data.importantCities.forEach(city => {
                const marker = createCityMarker(city, true).addTo(map);
                markers.push(marker);
            });

            // Handle zoom levels for visibility
            map.on('zoomend', () => {
                const currentZoom = map.getZoom();
                
                // Show/hide region labels and borders
                regionLabels.forEach(label => {
                    if (currentZoom <= 6) {
                        label.getElement().style.display = 'block';
                    } else {
                        label.getElement().style.display = 'none';
                    }
                });

                // Show/hide city markers and labels
                markers.forEach(marker => {
                    if (currentZoom > 6) {
                        marker.getElement().style.display = 'block';
                    } else {
                        marker.getElement().style.display = 'none';
                    }
                });

                // Adjust region border opacity
                regionPolygons.forEach(polygon => {
                    polygon.setStyle({ opacity: currentZoom <= 6 ? 0.8 : 0.4 });
                });
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
