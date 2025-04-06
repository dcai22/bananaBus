const puppeteer = require('puppeteer');
// not typed to run node in console, typesafe it later

// Converts Utama Mall's Date format (/Date(x+timezone)/) to iso string 
function convertDateFormat(dateString) {
    const match = dateString.match(/\/Date\((\d+)([+-]\d+)?\)\//)
    if (!match) return "Date not found"
    return new Date(parseInt(match[1], 10)).toISOString()
}


async function scrapeUtamaDeals() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.1utama.com.my/trending-promo/', { waitUntil: 'networkidle2' });
    
    const promo = await page.evaluate(() =>  {
        const scriptElement = document.querySelector("#promo_api-js-extra")
        if (!scriptElement) {
            console.error("Script element not found")
            return
        }
        const scriptText = scriptElement.innerHTML.trim()
        const match = scriptText.match(/var WP_API_PROMO = \[(\[.*?\])\];/s);
        if (match && match[1]) {
            return match[1]
        } else {
            console.error("JSON data not found")
        }
    })

    const data = JSON.parse(promo);
    const deals = []
    for (const store of Array.from(data)) {
        for (const promo of store.Promotions) {
            deals.push({
                title: promo.Name,
                description: promo.Description,
                location: "Utama Mall " + promo.LotId,
                img: promo.LeafletUrl, // images from utama, probs need to save image to load faster
                validFrom: convertDateFormat(promo.ValidFrom),
                validTo: convertDateFormat(promo.ValidTo),
            })
        }
    }
    
    console.log(deals)
    await browser.close();

    return deals;
}

// run utama scraper
scrapeUtamaDeals().then(() => console.log("done"));