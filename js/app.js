// Map Configuration
const mapConfig = {
    initialView: {
        center: [27, 45],
        zoom: 5,
        minZoom: 3,
        maxZoom: 8
    },
    bounds: L.latLngBounds([[12, 25], [44, 60]]),
    zoomLevels: {
        region: 6,
        city: 8
    }
};

// Initialize Map
const map = L.map('map', {
    center: mapConfig.initialView.center,
    zoom: mapConfig.initialView.zoom,
    minZoom: mapConfig.initialView.minZoom,
    maxZoom: mapConfig.initialView.maxZoom,
    zoomControl: true,
    zoomAnimation: true,
    worldCopyJump: true,
    zoomSnap: 0,
    zoomDelta: 0.1,
    markerZoomAnimation: false
});

// Add Base Map Layer
const baseMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abcd',
    maxZoom: mapConfig.initialView.maxZoom,
    noWrap: true
}).addTo(map);

// Store Markers
const markers = {
    regions: [],
    lines: [],
    cities: [],
    importantCities: []
};

// Utility Functions
const createDivIcon = (className, html) => {
    return L.divIcon({
        className: className,
        html: html,
        iconSize: null,
        iconAnchor: [0, 0]
    });
};

// Marker Visibility Management
let updateTimeout;
function updateMarkerVisibility() {
    const currentZoom = map.getZoom();
    
    if (currentZoom >= mapConfig.zoomLevels.city) {
        markers.cities.forEach(marker => map.addLayer(marker));
        markers.importantCities.forEach(marker => map.addLayer(marker));
        markers.regions.forEach(marker => map.removeLayer(marker));
        markers.lines.forEach(line => map.removeLayer(line));
    } else if (currentZoom >= mapConfig.zoomLevels.region) {
        markers.cities.forEach(marker => map.removeLayer(marker));
        markers.importantCities.forEach(marker => map.removeLayer(marker));
        markers.regions.forEach(marker => map.addLayer(marker));
        markers.lines.forEach(line => map.addLayer(line));
    } else {
        Object.values(markers).flat().forEach(marker => {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        });
    }
}

// Event Listeners
map.on('zoomend', () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateMarkerVisibility, 100);
});

// Data Loading and Processing
fetch('data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Add Regions
        data.regions.forEach(region => {
            const line = L.polyline(region.coords, {
                color: '#2c3e50',
                weight: 2.5,
                opacity: 0.8,
                dashArray: '5, 8',
                smoothFactor: 1.5
            }).addTo(map);
            
            const divIcon = createDivIcon('region-label', region.name);
            const marker = L.marker(region.labelCoords, {
                icon: divIcon,
                zIndexOffset: 1000
            }).addTo(map);
            
            markers.regions.push(marker);
            markers.lines.push(line);
        });

        // Add Regular Cities
        data.cities.forEach(city => {
            const divIcon = createDivIcon('city-label', `<span>${city.name}</span>`);
            const marker = L.marker(city.coords, {
                icon: divIcon,
                interactive: true,
                bubblingMouseEvents: false,
                pane: 'markerPane'
            }).addTo(map);
            
            markers.cities.push(marker);
        });

        // Add Important Cities
        data.importantCities.forEach(city => {
            const divIcon = createDivIcon('important-city-label', `<span>${city.name}</span>`);
            const marker = L.marker(city.coords, {
                icon: divIcon,
                interactive: true,
                bubblingMouseEvents: false,
                pane: 'markerPane'
            }).addTo(map);
            
            markers.importantCities.push(marker);
        });

        updateMarkerVisibility();
    })
    .catch(error => {
        console.error('Error loading map data:', error);
        // You could add a user-friendly error message here
    });

// Window Resize Handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        map.invalidateSize();
    }, 250);
});
