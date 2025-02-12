let allResults = []; // array to store results
let currentIndex = 0; // Index to track the next batch to load
const batchSize = 18; // Number of results to load per batch
const defaultRadius = 5000; // Default radius value
let apiKey = ""; // The key will be fetched from the server later

//Fetch the API Key from the server when loading the page
async function fetchApiKey() {
    try {
        const response = await fetch("/get-api-key");
        const data = await response.json();
        if (!data.apiKey) throw new Error("API Key not found");
        apiKey = data.apiKey;
    } catch (error) {
        console.error("Error fetching API Key:", error);
        alert("Failed to load API Key.");
    }
}

// Fetch user's location then search for nearby places
function fetchUserLocationAndPlaces() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchNearbyPlaces(latitude, longitude);
            },
            (error) => {
                console.error('Error getting user location:', error);
                alert('We were unable to reach your location. Make sure GPS is turned on.');
            }
        );
    } else {
        alert('Your browser does not support geolocation.');
    }
}

// Find nearby places
function fetchNearbyPlaces(latitude, longitude) {
    // Clear previous results
    allResults = [];
    currentIndex = 0;
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('see-more-btn').style.display = 'none';

    // Collect values from fields
    const radius = document.getElementById('radius').value || defaultRadius;
    const keyword = document.getElementById('keyword').value || undefined;
    const placeType = document.getElementById('placeType').value || undefined;

    // Send the request to the server that will fetch data from the Google Places API
    fetch(`/api/places?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&type=${placeType}`)
        .then(response => response.json())
        .then(data => {
            allResults = data.results;
            displayNextBatch();
        })
        .catch(error => {
            console.error("Error fetching places:", error);
            alert("An error occurred while loading places.");
        });
}

// Display data on the page
function displayNextBatch() {
    const container = document.getElementById("suggestions");
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const batch = allResults.slice(currentIndex, currentIndex + batchSize);

    batch.forEach((place) => {
        service.getDetails({ placeId: place.place_id }, (placeDetails, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayPlaceDetails(placeDetails);
            }
        });
    });

    currentIndex += batchSize;

    // Show or hide the See More button
    document.getElementById('see-more-btn').style.display = 
        currentIndex < allResults.length ? 'block' : 'none';
}

// View location details
function displayPlaceDetails(place) {
    const container = document.getElementById('suggestions');
    const placeElement = document.createElement('div');
    placeElement.classList.add('place-item');

    const mapLink = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
    const isOpenNow = place.opening_hours && place.opening_hours.isOpen(new Date());

    placeElement.innerHTML = `
        <h4 class='placeName'>${place.name}</h4>
        <p class='address'>${place.vicinity}</p>
        ${place.rating ? `<p class="rating">Rating: ${place.rating} ⭐</p>` : ''}
        ${isOpenNow ? `<p class='openNow'>Open Now</p>` : `<p class="closed">Closed</p>`}
        ${place.formatted_phone_number ? `<p class='phoneNum'>Phone: ${place.formatted_phone_number}</p>` : ''}
        <div class='links'> <a href="${mapLink}" target="_blank"> Get Location</a> </div>
    `;
    container.appendChild(placeElement);
}

// Search when you click the search button
document.getElementById('search-button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchNearbyPlaces(latitude, longitude);
            },
            (error) => {
                console.error('Error getting user location:', error);
                alert("We didn't get a result. افتح اللوكيشن يا عرص");
            }
        );
    } else {
        alert('Your browser does not support geolocation.');
    }
});

// Load more results
document.getElementById('see-more-btn').addEventListener('click', displayNextBatch);

// Load the page
window.onload = async function() {
    await fetchApiKey(); // Download the API Key before any other requests
    fetchUserLocationAndPlaces();
};

// skeleton loader
window.addEventListener("load", function() {
    document.getElementById("skeleton-loader").style.display = "none";
    document.querySelector("header").classList.remove("hidden");
});

// Search by type
function searchByType(placeType) {
    let location = document.querySelector("input[name='location']").value;
    let radius = document.querySelector("input[name='radius']").value || 5000; // 5KM Default
    if (!location) {
        alert("Please enter a location.");
        return;
    }
    document.querySelector("select[name='placeType']").value = placeType;
    document.getElementById("searchButton").click();
}

// Show side menu
document.querySelector(".fa-bars").addEventListener("click", function() {
    document.querySelector(".contain").classList.toggle("show");
});

// Alert when clicking on the profile icon
document.querySelector(".profileIcon").addEventListener("click", function () {
    alert("Not Available Yet!!");
});
