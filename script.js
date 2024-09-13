document.addEventListener('DOMContentLoaded', function() {
    const itemList = document.getElementById('itemList');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (!itemList) {
        console.error('Item list not found');
        return;
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            document.getElementById('priceListModal').style.display = 'none';
        });
    } else {
        console.error('Close button not found');
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
                const prices = row.slice(1);
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
        });
});

function changeQuantity(index, delta) {
    const quantityElem = document.getElementById(`quantity-${index}`);
    let quantity = parseInt(quantityElem.textContent);
    if (isNaN(quantity)) {
        quantity = 0;
    }
    quantity = Math.max(0, quantity + delta); // Prevent negative quantity
    quantityElem.textContent = quantity;
    updateTotal();
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

        // Update totals for each store
        prices.forEach((price, storeIndex) => {
            total[stores[storeIndex]] += price * quantity;
        });
    });

    const cheapestStore = Object.keys(total).reduce((a, b) => total[a] < total[b] ? a : b);

    alert(`Total for HEB: $${total.HEB.toFixed(2)}
Total for Walmart: $${total.Walmart.toFixed(2)}
Total for Target: $${total.Target.toFixed(2)}
Total for Randalls: $${total.Randalls.toFixed(2)}
Total for Kroger: $${total.Kroger.toFixed(2)}
Total for Fiesta: $${total.Fiesta.toFixed(2)}
Cheapest store: ${cheapestStore}`);
}

function submitSelection() {
    updateTotal();
}
