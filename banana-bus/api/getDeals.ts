import HTTPError from "http-errors";
import { Promotion } from "./interface";
import { scrapeUtamaDeals } from "./scraper";

export async function getDeals(): Promise<Promotion[]> {
    let promos: Promotion[] = []
    // to be replaced with db ideally 
    // where db runs scraper daily or something then then function just retrieves from db
    // scraper takes too long
    try {
        promos = await scrapeUtamaDeals()
        return promos
      } catch (error) {
        throw HTTPError(404, `Unable to fetch deals, ${error}`);
    }
}