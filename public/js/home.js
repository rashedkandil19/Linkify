let allResults = []; // لتخزين النتائج
let currentIndex = 0; // تتبع النتائج المحملة
const batchSize = 18; // عدد النتائج في كل دفعة
const defaultRadius = 5000; // القيمة الافتراضية لنصف القطر
let apiKey = ""; // سيتم جلب المفتاح لاحقًا

// تحميل مفتاح API من السيرفر
async function fetchApiKey() {
    try {
        const response = await fetch("/get-api-key");
        const data = await response.json();
        if (!data.apiKey) throw new Error("API Key not found");
        apiKey = data.apiKey;
        await loadGoogleMapsAPI(apiKey);
    } catch (error) {
        console.error("Error fetching API Key:", error);
        alert("Failed to load API Key.");
    }
}

// تحميل Google Maps API
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

// جلب الموقع والبحث عن الأماكن القريبة
function fetchUserLocationAndPlaces() {
    if (!navigator.geolocation) {
        alert('Your browser does not support geolocation.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetchNearbyPlaces(latitude, longitude);
        },
        (error) => {
            console.error('Error getting user location:', error);
            alert('We were unable to get your location. Make sure GPS is turned on.');
        }
    );
}

// البحث عن الأماكن القريبة
async function fetchNearbyPlaces(latitude, longitude) {
    try {
        allResults = [];
        currentIndex = 0;
        document.getElementById('suggestions').innerHTML = '';
        document.getElementById('see-more-btn').style.display = 'none';

        const radius = document.getElementById('radius').value || defaultRadius;
        const keyword = document.getElementById('keyword').value.trim();
        const placeType = document.getElementById('placeType').value;

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

// عرض النتائج
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

    // إظهار زر "عرض المزيد" إذا كان هناك نتائج متبقية
    document.getElementById('see-more-btn').style.display = 
        currentIndex < allResults.length ? 'block' : 'none';
}

// عرض تفاصيل المكان
function displayPlaceDetails(place) {
    const container = document.getElementById('suggestions');
    const placeElement = document.createElement('div');
    placeElement.classList.add('place-item');

    const mapLink = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
    const isOpenNow = place.opening_hours && place.opening_hours.isOpen(new Date());

    placeElement.innerHTML = `
        <h4 class='placeName'>${place.name}</h4>
        <p class='address'>${place.vicinity || "Location unavailable"}</p>
        ${place.rating ? `<p class="rating">Rating: ${place.rating} ⭐</p>` : ''}
        ${isOpenNow ? `<p class='openNow'>Open Now</p>` : `<p class="closed">Closed</p>`}
        ${place.formatted_phone_number ? `<p class='phoneNum'>Phone: ${place.formatted_phone_number}</p>` : ''}
        <div class='links'> <a href="${mapLink}" target="_blank"> Get Location</a> </div>
    `;
    container.appendChild(placeElement);
}

// تشغيل البحث عند الضغط على زر البحث
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
                alert("We couldn't retrieve your location. Please enable location services.");
            }
        );
    } else {
        alert('Your browser does not support geolocation.');
    }
});

// تحميل المزيد من النتائج
document.getElementById('see-more-btn').addEventListener('click', displayNextBatch);

// تحميل الصفحة
window.onload = async function() {
    await fetchApiKey(); // تحميل مفتاح API أولًا
    fetchUserLocationAndPlaces();
};

// إخفاء اللودر بعد تحميل الصفحة
window.addEventListener("load", function() {
    document.getElementById("skeleton-loader").style.display = "none";
    document.querySelector("header").classList.remove("hidden");
});

// البحث حسب النوع
function searchByType(placeType) {
    let location = document.querySelector("input[name='location']").value;
    let radius = document.querySelector("input[name='radius']").value || 5000; // 5KM افتراضي
    if (!location) {
        alert("Please enter a location.");
        return;
    }
    document.querySelector("select[name='placeType']").value = placeType;
    document.getElementById("search-button").click();
}

// إظهار القائمة الجانبية
document.querySelector(".fa-bars").addEventListener("click", function() {
    document.querySelector(".contain").classList.toggle("show");
});

// تنبيه عند الضغط على أيقونة الملف الشخصي
document.querySelector(".profileIcon").addEventListener("click", function () {
    alert("Not Available Yet!!");
});
