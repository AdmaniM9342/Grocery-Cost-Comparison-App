document.addEventListener('DOMContentLoaded', function() {
    const itemList = document.getElementById('itemList');
    const totalsList = document.getElementById('totalsList');
    const travelCostsElem = document.getElementById('travelCosts');

    if (!itemList || !totalsList || !travelCostsElem) {
        console.error('Item list, totals list, or travel cost info not found');
        return;
    }

    // Load and process the Excel data
    fetch('Data.xlsx')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const headers = data[0];
            const itemData = data.slice(1);
            const stores = headers.slice(1); // Store names

            itemData.forEach((row, index) => {
                const itemName = row[0];
                const prices = row.slice(1).map(price => parseFloat(price) || 0); // Ensure prices are numbers
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${itemName}</span>
                    <button type="button" onclick="changeQuantity(${index}, -1)">-</button>
                    <span id="quantity-${index}">0</span>
                    <button type="button" onclick="changeQuantity(${index}, 1)">+</button>
                    <input type="hidden" id="prices-${index}" value='${JSON.stringify(prices)}'>
                `;
                itemList.appendChild(li);
            });

            updateTotal(); // Initialize totals on load
            getUserLocation(); // Get user's location and update travel costs
        })
        .catch(error => console.error('Error loading Excel data:', error));
});

function changeQuantity(index, delta) {
    const quantityElem = document.getElementById(`quantity-${index}`);
    let quantity = parseInt(quantityElem.textContent);
    if (isNaN(quantity)) {
        quantity = 0;
    }
    quantity = Math.max(0, quantity + delta); // Prevent negative quantity
    quantityElem.textContent = quantity;

    updateTotal(); // Update totals whenever quantity is changed
}

function updateTotal() {
    const quantities = document.querySelectorAll('[id^="quantity-"]');
    const stores = ['HEB', 'Walmart', 'Target', 'Randalls', 'Kroger', 'Fiesta'];
    let total = {};

    // Initialize totals for each store
    stores.forEach(store => total[store] = 0);

    quantities.forEach((quantityElem) => {
        const index = quantityElem.id.split('-')[1];
        const quantity = parseInt(quantityElem.textContent);
        const prices = JSON.parse(document.getElementById(`prices-${index}`).value);

        if (isNaN(quantity) || !Array.isArray(prices) || prices.some(isNaN)) {
            console.error(`Invalid data for item ${index}: Quantity=${quantity}, Prices=${prices}`);
            return;
        }

        // Update totals for each store
        prices.forEach((price, storeIndex) => {
            if (typeof price === 'number') {
                total[stores[storeIndex]] += price * quantity;
            }
        });
    });

    // Clear previous totals
    totalsList.innerHTML = '';

    // Find the cheapest store
    let cheapestStore = null;
    let cheapestPrice = Infinity;

    for (const [store, amount] of Object.entries(total)) {
        const li = document.createElement('li');
        li.innerHTML = `${store}: $${amount.toFixed(2)}`;
        totalsList.appendChild(li);

        // Update the cheapest store
        if (amount < cheapestPrice) {
            cheapestPrice = amount;
            cheapestStore = store;
        }
    }

    // Display the cheapest option
    const cheapestOption = document.createElement('li');
    cheapestOption.style.fontWeight = 'bold';
    cheapestOption.innerHTML = `Cheapest Option: ${cheapestStore} at $${cheapestPrice.toFixed(2)}`;
    totalsList.appendChild(cheapestOption);
}
document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculateButton');

    // Attach click event to the button
    calculateButton.addEventListener('click', function() {
        updateTravelCosts();
    });

    // Optional: Get user location from browser if permission is granted
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                document.getElementById('userLat').value = position.coords.latitude;
                document.getElementById('userLon').value = position.coords.longitude;
            },
            error => {
                console.error('Error getting location from browser:', error);
            }
        );
    }
});

function updateTravelCosts() {
    const userLat = parseFloat(document.getElementById('userLat').value);
    const userLon = parseFloat(document.getElementById('userLon').value);
    const fuelCostPerMile = 12; // Adjust as needed
    const mileagePerGallon = 40;  // Adjust as needed

    if (isNaN(userLat) || isNaN(userLon)) {
        alert('Please enter valid latitude and longitude values.');
        return;
    }

    // Store location data (Replace with actual store coordinates)
    const storeData = {
        'HEB': { lat: 30.7604, lon: -95.3698 },
        'Walmart': { lat: 29.8604, lon: -93.3698 },
        'Target': { lat: 29.7604, lon: -94.3698 },
        'Randalls': { lat: 28.7604, lon: -95.3698 },
        'Kroger': { lat: 29.7604, lon: -97.3698 },
        'Fiesta': { lat: 30.7604, lon: -95.3698 }
    };

    const travelCostsDiv = document.getElementById('travelCosts');
    travelCostsDiv.innerHTML = ''; // Clear previous travel cost calculations

    Object.keys(storeData).forEach(store => {
        const storeLat = storeData[store].lat;
        const storeLon = storeData[store].lon;
        const distance = calculateDistance(userLat, userLon, storeLat, storeLon);
        const cost = (distance / mileagePerGallon) * fuelCostPerMile;

        const costElem = document.createElement('div');
        costElem.innerHTML = `
            <h3>${store}</h3>
            <p>Distance: ${distance.toFixed(2)} miles</p>
            <p>Travel Cost: $${cost.toFixed(2)}</p>
        `;
        travelCostsDiv.appendChild(costElem);
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

