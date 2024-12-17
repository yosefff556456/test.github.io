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
            // Store markers and polygons
            const markers = [];
            const polygons = [];

            // Add regions (polygons)
            data.regions.forEach(region => {
                const polygon = L.polygon(region.coords, {
                    color: '#ffffff',
                    weight: 2,
                    opacity: 0.6,
                    fillColor: '#ffffff',
                    fillOpacity: 0.1
                }).addTo(map);
                polygons.push(polygon);
            });

            // Add cities
            data.cities.forEach(city => {
                const marker = L.marker(city.coords, {
                    icon: L.divIcon({
                        className: 'city-marker',
                        iconSize: [8, 8]
                    })
                }).addTo(map);
                markers.push(marker);
            });

            // Add important cities
            data.importantCities.forEach(city => {
                const marker = L.marker(city.coords, {
                    icon: L.divIcon({
                        className: 'important-city-marker',
                        iconSize: [10, 10]
                    })
                }).addTo(map);
                markers.push(marker);
            });

            // Handle zoom levels for marker and region visibility
            map.on('zoomend', () => {
                const currentZoom = map.getZoom();
                
                markers.forEach(marker => {
                    if (currentZoom >= 7) {
                        marker.getElement().style.display = 'block';
                    } else {
                        marker.getElement().style.display = 'none';
                    }
                });

                polygons.forEach(polygon => {
                    if (currentZoom >= 6) {
                        polygon.setStyle({ opacity: 0.6, fillOpacity: 0.1 });
                    } else {
                        polygon.setStyle({ opacity: 0.3, fillOpacity: 0.05 });
                    }
                });
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
