import HTTPError from "http-errors";
import { Promotion } from "./interface";
import axios from "axios";

export async function getDeals(): Promise<Promotion[]> {
    let promos: Promotion[] = []

    try {
        promos = await scrapeUtamaDeals()
        return promos
    } catch (error) {
        throw HTTPError(404, `Unable to fetch deals, ${error}`);
    }
}

// Converts Utama Mall's Date format (/Date(x+timezone)/) to iso string 
function convertDateFormat(dateString: string) {
  const match = dateString.match(/\/Date\((\d+)([+-]\d+)?\)\//)
  if (!match) return "Date not found"
  return new Date(parseInt(match[1], 10)).toISOString()
}

async function scrapeUtamaDeals(): Promise<Promotion[]> {
    const response = await axios.get('https://www.1utama.com.my/trending-promo/');
    const html = response.data;

    const match = html.match(/var WP_API_PROMO = \[(\[.*?\])\];/s);

    if (!match) {
        throw HTTPError(404,"Promotions JSON data not found");
    }

    const data = JSON.parse(match[1]);

    const deals: Promotion[] = []
    for (const store of Array.from(data)) {
        for (const promo of (store as any).Promotions) {
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
    return deals;
}