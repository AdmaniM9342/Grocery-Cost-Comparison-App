document.addEventListener('DOMContentLoaded', function() {
    const items = [
        'SODA', 'MILK', 'CHIPS', 'EGGS', 'BREAD', 'BREAKFAST CEREAL', 
        'CANDY BARS', 'BLOCK CHEESE', 'BEER', 'BOTTLED WATER', 
        'CIGARETTES', 'CHOCOLATE BARS', 'SNACK CAKES', 'COOKIES', 
        'PEPPERONI', 'WINE', 'CUPCAKES', 'BREAKFAST BARS', 'FRESH FRUITS', 
        'FRESH VEGETABLES', 'LIQUORS', 'FRIED CHICKEN', 'CANDIES', 'COFFEE',
        'YOGURTS', 'FRUIT JUICES', 'FRESH & FROZEN BEEF', 'HOT DOGS',
        'PEANUT BUTTER', 'HOUSEHOLD CLEANERS', 'BABY DISPOSABLE DIAPERS',
        'MAYONNAISE', 'SANDWICHES', 'FROZEN PIZZA', 'CREAM & DESSERTS',
        'ICE CREAM', 'SAUSAGES', 'PHILADELPHIA CREAM CHEESE', 'BUTTER',
        'PAINKILLERS', 'VITAMIN C', 'PASTA', 'DELI ROLLS', 'EGGO WAFFLES',
        'BISCUITS', 'FROZEN FISH', 'FROZEN SEAFOOD', 'LEGUMES', 'CEREAL GRAINS',
        'MEAL KITS', 'DONUTS', 'TEA', 'DOG & CAT FOOD', 'GIFT CARDS',
        'CANNED SOUPS', 'CANNED CHICKEN', 'TUNA FISH', 'NUTS', 'DISH SOAP',
        'DETERGENTS', 'TOILET PAPER', 'JAMS', 'HONEY', 'ENERGY DRINKS',
        'FROZEN VEGETABLES', 'DISPOSABLE CUPS', 'DISPOSABLE UTENSILS',
        'SOYBEAN OIL', 'FLOUR', 'DISPOSABLE SHAVING RAZORS', 'MEATBALLS',
        'KETCHUP', 'CHEWING GUM', 'NOODLES', 'DISPOSABLE PLATES', 'TISSUES',
        'OLIVE OIL', 'SAUCES', 'SHAMPOO', 'BABY FOOD', 'SKINCARE PRODUCTS',
        'TOOTHPASTE', 'SOAP', 'TOMATO PASTE', 'BAKING POWDER', 'ICE CUBES',
        'BAGGED SALADS', 'PACKAGED MAC & CHEESE', 'VINEGAR', 'BATTERIES',
        'HAND SANITIZERS', 'FLOWERS', 'SPICES', 'PRETZELS', 'SHOWER GELS',
        'DEODORANTS', 'SUGAR', 'FEMININE HYGIENE PRODUCTS', 'TOOTHBRUSHES'
    ];

    const itemList = document.getElementById('itemList');

    // Create checkboxes, plus and minus buttons dynamically for each item
    items.forEach(item => {
        const li = document.createElement('li');

        li.innerHTML = `
            <input type="checkbox" name="${item}" id="${item}">
            <label for="${item}">${item}</label>
            <button type="button" onclick="decreaseQuantity('${item}')">-</button>
            <span id="quantity_${item}">0</span>
            <button type="button" onclick="increaseQuantity('${item}')">+</button>
        `;
        itemList.appendChild(li);
    });

    // Fetch and parse the XLSX file
    
    fetch('Data.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            window.prices = {};
            window.quantities = {}; // To track quantities
            jsonData.forEach(row => {
                if (row.length > 0) {
                    const [item, HEB, Walmart, Target, Randalls, Kroger, Fiesta] = row;
                    window.prices[item] = {
                        HEB: parseFloat(HEB) || 0,
                        Walmart: parseFloat(Walmart) || 0,
                        Target: parseFloat(Target) || 0,
                        Randalls: parseFloat(Randalls) || 0,
                        Kroger: parseFloat(Kroger) || 0,
                        Fiesta: parseFloat(Fiesta) || 0
                    };
                    window.quantities[item] = 0; // Initialize quantities to 0
                }
            });
        })
        .catch(error => console.error('Error fetching or parsing XLSX file:', error));
});

function submitSelection() {
    const checkboxes = document.querySelectorAll('#itemList input[type="checkbox"]');
    const priceList = document.getElementById('priceList');
    priceList.innerHTML = '';

    const storeTotals = { HEB: 0, Walmart: 0, Target: 0, Randalls: 0, Kroger: 0, Fiesta: 0 };

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const itemName = checkbox.name;
            const quantity = window.quantities[itemName] || 0;  // Use the tracked quantity

            if (window.prices && window.prices[itemName]) {
                const { HEB, Walmart, Target, Randalls, Kroger, Fiesta } = window.prices[itemName];
                const itemCostHEB = HEB * quantity;
                const itemCostWalmart = Walmart * quantity;
                const itemCostTarget = Target * quantity;
                const itemCostRandalls = Randalls * quantity;
                const itemCostKroger = Kroger * quantity;
                const itemCostFiesta = Fiesta * quantity;

                storeTotals.HEB += itemCostHEB;
                storeTotals.Walmart += itemCostWalmart;
                storeTotals.Target += itemCostTarget;
                storeTotals.Randalls += itemCostRandalls;
                storeTotals.Kroger += itemCostKroger;
                storeTotals.Fiesta += itemCostFiesta;

                const itemPriceHTML = `
                    <p><strong>${itemName}</strong> (x${quantity}): 
                    HEB: $${itemCostHEB.toFixed(2)}, 
                    Walmart: $${itemCostWalmart.toFixed(2)}, 
                    Target: $${itemCostTarget.toFixed(2)}, 
                    Randalls: $${itemCostRandalls.toFixed(2)}, 
                    Kroger: $${itemCostKroger.toFixed(2)}, 
                    Fiesta: $${itemCostFiesta.toFixed(2)}</p>
                `;
                priceList.innerHTML += itemPriceHTML;
            }
        }
    });

    const cheapestStore = Object.keys(storeTotals).reduce((a, b) => storeTotals[a] < storeTotals[b] ? a : b);

    priceList.innerHTML += '<h3>Totals:</h3>';
    priceList.innerHTML += `<p>Total at HEB: $${storeTotals.HEB.toFixed(2)}</p>`;
    priceList.innerHTML += `<p>Total at Walmart: $${storeTotals.Walmart.toFixed(2)}</p>`;
    priceList.innerHTML += `<p>Total at Target: $${storeTotals.Target.toFixed(2)}</p>`;
    priceList.innerHTML += `<p>Total at Randalls: $${storeTotals.Randalls.toFixed(2)}</p>`;
    priceList.innerHTML += `<p>Total at Kroger: $${storeTotals.Kroger.toFixed(2)}</p>`;
    priceList.innerHTML += `<p>Total at Fiesta: $${storeTotals.Fiesta.toFixed(2)}</p>`;

    priceList.innerHTML += `<h3>Cheapest Store:</h3>`;
    priceList.innerHTML += `<p>The cheapest store is ${cheapestStore} with a total of $${storeTotals[cheapestStore].toFixed(2)}</p>`;

    if (priceList.innerHTML === '') {
        priceList.innerHTML = '<p>No items selected or prices not available.</p>';
    }
	modal.style.display = "flex";
}

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    const startSavingButton = document.getElementById('startSaving');
    if (startSavingButton) {
        startSavingButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'list.html';
        });
    }
});
const modal = document.getElementById("priceListModal");
const closeModalBtn = document.getElementsByClassName("close")[0];
closeModalBtn.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
