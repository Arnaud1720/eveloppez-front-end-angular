import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {LoggingService} from "./logService";

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient, private logger: LoggingService) {}

  loadInitialData() {
    return this.http.get<any>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((err) => {
        this.logger.logError('Erreur chargement JSON', err);
        this.olympics$.next(null);
        return throwError(() => err);
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
}
