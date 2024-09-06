document.addEventListener('DOMContentLoaded', function() {
    const items = [
        'SODA', 'MILK', 'CHIPS', 'EGGS', 'BREAD', 'BREAKFAST CEREAL', 'CANDY BARS',
        'BLOCK CHEESE', 'BEER', 'BOTTLED WATER', 'CIGARETTES', 'CHOCOLATE BARS',
        'SNACK CAKES', 'COOKIES & CRACKERS', 'PEPPERONI', 'WINE', 'CUPCAKES', 'BREAKFAST BARS',
        'FRESH FRUITS', 'FRESH VEGETABLES', 'LIQUORS', 'FRIED CHICKEN', 'CANDIES', 'COFFEE',
        'YOGURTS', 'FRUIT JUICES', 'FRESH & FROZEN BEEF', 'HOT DOGS', 'PEANUT BUTTER',
        'HOUSEHOLD CLEANERS', 'BABY DISPOSABLE DIAPERS', 'MAYONNAISE', 'SANDWICHES',
        'FROZEN PIZZA', 'CREAM & CREAM DESSERTS', 'ICE CREAM', 'SAUSAGES', 'PHILADELPHIA CREAM CHEESE',
        'BUTTER', 'PAINKILLERS', 'VITAMIN C', 'PASTA & MACARONI', 'DELI ROLLS', 'EGGO FROZEN WAFFLES',
        'BISCUITS', 'FROZEN FISH', 'FROZEN SEAFOOD', 'LEGUMES', 'CEREAL GRAINS', 'MEAL KITS',
        'DONUTS', 'TEA', 'DOG & CAT FOOD', 'GIFT CARDS', 'CANNED SOUPS', 'CANNED CHICKEN',
        'TUNA FISH', 'NUTS', 'DISH SOAP', 'DETERGENTS', 'TOILET PAPER', 'JAMS & APPLESAUCE',
        'HONEY & MAPLE SYRUP', 'ENERGY DRINKS', 'FROZEN VEGETABLES', 'GREEN BEANS',
        'DISPOSABLE CUPS', 'DISPOSABLE UTENSILS', 'SOYBEAN OIL', 'FLOUR', 'DISPOSABLE SHAVING RAZORS',
        'MEATBALLS', 'KETCHUP, MAYONNAISE', 'CHEWING GUM', 'NOODLES & INSTANT SOUPS', 'DISPOSABLE PLATES',
        'TISSUES & PAPER TOWELS', 'OLIVE OIL', 'SAUCES', 'SHAMPOO', 'BABY FOOD', 'SKINCARE PRODUCTS',
        'TOOTHPASTE', 'SOAP', 'TOMATO PASTE', 'BAKING POWDER', 'ICE CUBES', 'BAGGED SALADS',
        'PACKAGED MAC & CHEESE', 'VINEGAR', 'BATTERIES', 'HAND SANITIZERS', 'FLOWERS',
        'SPICES, HERBS & SEASONINGS', 'PRETZELS', 'SHOWER GELS', 'DEODORANTS', 'SUGAR & SALT',
        'FEMININE HYGIENE PRODUCTS', 'TOOTHBRUSHES'
    ];

    const itemList = document.getElementById('itemList');
    items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" name="${item}" id="${item}"> <label for="${item}">${item}</label>`;
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
            jsonData.forEach(row => {
                if (row.length > 0) {
                    const [item, HEB, Walmart, Target, Randalls, Kroger, Fiesta] = row;
                    window.prices[item] = { HEB, Walmart, Target, Randalls, Kroger, Fiesta };
                }
            });
        });
});

function submitSelection() {
    const checkboxes = document.querySelectorAll('#itemForm input[type="checkbox"]');
    const selectedItems = [];
    const priceList = document.getElementById('priceList');
    priceList.innerHTML = ''; // Clear previous results

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const itemName = checkbox.name;
            if (window.prices && window.prices[itemName]) {
                const { HEB, Walmart, Target, Randalls, Kroger, Fiesta } = window.prices[itemName];
                const itemPriceHTML = `
                    <p><strong>${itemName}</strong>: HEB: $${HEB}, Walmart: $${Walmart}, Target: $${Target}, Randalls: $${Randalls}, Kroger: $${Kroger}, Fiesta: $${Fiesta}</p>
                `;
                priceList.innerHTML += itemPriceHTML;
            }
        }
    });

    if (priceList.innerHTML === '') {
        priceList.innerHTML = '<p>No items selected or prices not available.</p>';
    }
}
