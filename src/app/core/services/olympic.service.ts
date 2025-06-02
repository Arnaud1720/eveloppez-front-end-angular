import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {LoggingService} from "./logService";
import {Olympic} from "../models/Olympic";

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient, private logger: LoggingService) {}

  loadInitialData() {
    return this.http.get<Olympic>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((err) => {
        this.logger.logError('Erreur chargement JSON', err);
        this.olympics$.next(null);
        return throwError(() => err);
      })
    );
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }

  getTotalMedals(country: Olympic): number {
    return country.participations
      .reduce((acc, p) => acc + p.medalsCount, 0);
  }
  getNumberOfJOs(all: Olympic[]): number {
    // on “aplatit” tous les tableaux de participations en un seul
    const allYears: number[] = all.flatMap(c =>
      c.participations.map(p => p.year)
    );
    // on transforme en Set pour ne garder que les années uniques
    return new Set(allYears).size;
  }
}
