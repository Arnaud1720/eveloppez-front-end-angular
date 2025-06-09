import {Injectable} from "@angular/core";

@Injectable({ providedIn: 'root' })
export class LoggingService {
  logError(message: string, error: any) {
    console.error(`[OlympicService] ${message}`, error);
  }
}
