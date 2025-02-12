let allResults = [];
let currentIndex = 0;
const batchSize = 18;
const defaultRadius = 10000;
let userLocation = null;
function toggleSkeletonLoader(show) {
    const loader = document.getElementById("skeleton-loader");
    loader.style.display = show ? "flex" : "none";
}
function fetchUserLocationAndPlaces() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                userLocation = { latitude, longitude };
                fetchNearbyPlaces(latitude, longitude);
            },
            error => {
                alert('We were unable to reach your location. Make sure GPS is turned on.');
                userLocation = null;
            }
        );
    } else {
        alert('Your browser does not support geolocation.');
        userLocation = null;
    }
}
function fetchNearbyPlaces(latitude, longitude) {
    toggleSkeletonLoader(true);
    allResults = [];
    currentIndex = 0;
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('see-more-btn').style.display = 'none';
    const radius = document.getElementById('radius').value || defaultRadius;
    const keyword = document.getElementById('keyword').value || '';
    const placeType = document.getElementById('placeType').value || '';
    fetch(`/api/places?latitude=${latitude}&longitude=${longitude}&radius=${radius}&keyword=${keyword}&type=${placeType}`)
        .then(response => response.json())
        .then(data => {            
            if (data.results) {
                allResults = data.results;
                displayNextBatch();
            } else {
                console.error("No results found.");
                alert("No places found.");
            }
            toggleSkeletonLoader(false);
        })
        .catch(error => {
            console.error("Error fetching places:", error);
            alert("An error occurred while loading places.");
            toggleSkeletonLoader(false);
        });
}
function updateLocationAndSearch() {
    const latitude = userLocation?.latitude || 0;
    const longitude = userLocation?.longitude || 0;
    fetchNearbyPlaces(latitude, longitude);  
}
function displayNextBatch() {
    const container = document.getElementById("suggestions");
    const batch = allResults.slice(currentIndex, currentIndex + batchSize);
    batch.forEach(place => {
        const lat = place.geometry.location.lat;
        const lng = place.geometry.location.lng;
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.place_id}`;
        const phoneNumber = place.phone_number || "not available";
        const isOpenNow = place.opening_hours?.open_now ? "Open Now" : "Closed";
        const rating = place.rating || "Not rated";
        const placeElement = document.createElement('div');
        placeElement.classList.add('place-item');
        placeElement.innerHTML = `
            <h4 class='placeName'>${place.name}</h4>
            <p class='address'>${place.vicinity || "Address not available"}</p>
            <p class="rating">Rating: ${rating} ⭐</p>
            <p class="${isOpenNow === "Open Now" ? 'openNow' : 'closed'}">${isOpenNow}</p>
            <p class='phoneNum'>Phone: ${phoneNumber}</p>
            <div class='links'> <a href="${mapLink}" target="_blank">Get Location</a> </div>
        `;
        container.appendChild(placeElement);
    });
    
    currentIndex += batchSize;
    document.getElementById('see-more-btn').style.display = currentIndex < allResults.length ? 'block' : 'none';
}
document.getElementById('search-button').addEventListener('click', updateLocationAndSearch);
document.getElementById('see-more-btn').addEventListener('click', displayNextBatch);
window.onload = function() {
    fetchUserLocationAndPlaces();
};

// Skeleton loader
window.addEventListener("load", function() {
    document.getElementById("skeleton-loader").style.display = "none";
    document.querySelector("header").classList.remove("hidden");
});

let menuIcon = document.querySelector(".fa-bars");

menuIcon.addEventListener("click", function() {
    document.querySelector(".contain").classList.toggle("show");
});

let profileIcon = document.querySelector(".profileIcon");

profileIcon.addEventListener("click", function() {
    alert("profile section isn't avaliable yet")
});
