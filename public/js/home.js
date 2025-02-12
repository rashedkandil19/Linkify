let allResults = [];
let currentIndex = 0;
const batchSize = 18;
const defaultRadius = 5000;
let apiKey = "";

async function fetchApiKey() {
    try {
        const response = await fetch("/get-api-key");
        const data = await response.json();
        if (!data.apiKey) throw new Error("API Key not found");
        apiKey = data.apiKey;
        await loadGoogleMapsAPI(apiKey);
        fetchUserLocationAndPlaces(); 
    } catch (error) {
        console.error("Error fetching API Key:", error);
        alert("Failed to load API Key.");
    }
}

function loadGoogleMapsAPI(apiKey) {
    return new Promise((resolve, reject) => {
        if (typeof google !== "undefined") {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
    });
}

function fetchUserLocationAndPlaces() {
    if (!navigator.geolocation) {
        alert("Your browser does not support geolocation.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetchNearbyPlaces(latitude, longitude);
        },
        (error) => {
            console.error("Error getting user location:", error);
            alert("We were unable to get your location. Make sure GPS is turned on.");
        }
    );
}

async function fetchNearbyPlaces(latitude, longitude) {
    try {
        allResults = [];
        currentIndex = 0;
        document.getElementById("suggestions").innerHTML = "";
        document.getElementById("see-more-btn").style.display = "none";

        const radius = document.getElementById("radius")?.value || defaultRadius;
        const keyword = document.getElementById("keyword")?.value.trim();
        const placeType = document.getElementById("placeType")?.value;

        if (!keyword && !placeType) {
            alert("Please enter a keyword or select a place type.");
            return;
        }

        const response = await fetch(`/api/places?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&type=${placeType}`);
        const data = await response.json();
        allResults = data.results;
        displayNextBatch();
    } catch (error) {
        console.error("Error fetching places:", error);
        alert("An error occurred while loading places.");
    }
}

function displayNextBatch() {
    const service = new google.maps.places.PlacesService(document.createElement("div"));
    const batch = allResults.slice(currentIndex, currentIndex + batchSize);

    batch.forEach((place) => {
        service.getDetails({ placeId: place.place_id }, (placeDetails, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayPlaceDetails(placeDetails);
            }
        });
    });

    currentIndex += batchSize;
    document.getElementById("see-more-btn").style.display =
        currentIndex < allResults.length ? "block" : "none";
}

function displayPlaceDetails(place) {
    const container = document.getElementById("suggestions");
    const placeElement = document.createElement("div");
    placeElement.classList.add("place-item");

    const mapLink = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
    const isOpenNow = place.opening_hours?.isOpen(new Date());

    placeElement.innerHTML = `
        <h4 class='placeName'>${place.name}</h4>
        <p class='address'>${place.vicinity || "Location unavailable"}</p>
        ${place.rating ? `<p class="rating">Rating: ${place.rating} ⭐</p>` : ""}
        ${isOpenNow ? `<p class='openNow'>Open Now ✅</p>` : `<p class="closed">Closed ❌</p>`}
        ${place.formatted_phone_number ? `<p class='phoneNum'>Phone: ${place.formatted_phone_number}</p>` : ""}
        <div class='links'> <a href="${mapLink}" target="_blank"> Get Location</a> </div>
    `;
    container.appendChild(placeElement);
}

document.getElementById("search-button").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchNearbyPlaces(latitude, longitude);
            },
            (error) => {
                console.error("Error getting user location:", error);
                alert("We couldn't retrieve your location. Please enable location services.");
            }
        );
    } else {
        alert("Your browser does not support geolocation.");
    }
});

document.getElementById("see-more-btn").addEventListener("click", displayNextBatch);

window.onload = fetchApiKey;
window.addEventListener("load", () => {
    document.getElementById("skeleton-loader").style.display = "none";
    document.querySelector("header").classList.remove("hidden");
});
