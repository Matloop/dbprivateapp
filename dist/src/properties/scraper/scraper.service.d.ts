import { PropertiesService } from '../properties.service';
export declare class ScraperService {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    scrapeLegacySystem(): Promise<void>;
}
