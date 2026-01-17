// Campus Coordinates (Mock)
const CAMPUS_CENTER = {
    lat: 28.6139,
    lng: 77.2090
};

export const checkGeofence = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Check if geolocation is available in navigator
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported by browser. Bypassing for demo.');
            resolve(true);
            return;
        }

        try {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const distance = getDistanceFromLatLonInKm(
                        latitude, 
                        longitude, 
                        CAMPUS_CENTER.lat, 
                        CAMPUS_CENTER.lng
                    ) * 1000; // Convert to meters

                    console.log(`User distance: ${distance.toFixed(2)}m`);
                    // In a real app, you would check: resolve(distance <= 200);
                    resolve(true); 
                },
                (error) => {
                    // Graceful fallback for demo environments (like WebContainer/Iframes)
                    // where Permissions Policy might block geolocation.
                    console.warn(`Geofence bypassed due to environment restriction: ${error.message}`);
                    resolve(true); 
                }
            );
        } catch (e) {
            console.warn("Geolocation API execution error. Bypassing.");
            resolve(true);
        }
    });
};

// Haversine Formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}
