import HTTPError from "http-errors";
import { Promotion } from "./interface";
import { scrapeUtamaDeals } from "./scraper";

export async function getDeals(routeId: number, departId: number, arriveId: number, date: string): Promise<Promotion[]> {
    let promos: Promotion[] = []
    // to be replaced with db ideally
    // scraper takes too long
    // 
    try {
        promos = await scrapeUtamaDeals()
        return promos
      } catch (error) {
        throw HTTPError(404, `Unable to fetch deals, ${error}`);
    }
}