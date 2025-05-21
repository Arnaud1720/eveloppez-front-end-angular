import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart, registerables } from 'chart.js';
import {Olympic} from "../../core/models/Olympic";
import {Router} from "@angular/router";
Chart.register(...registerables);   // une ligne, et basta
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
}
)
export class HomeComponent implements OnInit {
  public olympics$: Observable<any> = of(null);
  olympics: Olympic[] = [];

  constructor(private olympicService: OlympicService,private router: Router) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
  }
// ---------------------------------------------------------------------------
// 1) Fonction utilitaire : calculer le total de médailles d’un pays
// ---------------------------------------------------------------------------

  getTotalMedals(country: any): number {
    let total = 0;
    for (const p of country.participations) {
      total += p.medalsCount;
    }

    // On renvoie le total calculé
    return total;
  }
  getTotalAthletes(country: Olympic): number {
    let total = 0;
    for (const p of country.participations) {
      total += p.athleteCount;
    }
    return total;
  }
// ---------------------------------------------------------------------------
// 2) Récupérer le <canvas> dans lequel Chart.js dessinera le camembert
// ---------------------------------------------------------------------------

// @ViewChild dit à Angular : « Donne-moi la référence de ce canvas ».
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

// ---------------------------------------------------------------------------
// 3) ngAfterViewInit = moment où le template est entièrement rendu
// ---------------------------------------------------------------------------

  ngAfterViewInit(): void {
    this.olympics$.subscribe((olympics) => {
      if (olympics) {
        this.olympics = olympics; // ← à ne pas oublier
        this.drawChart(olympics);
      }
    });
  }


// ---------------------------------------------------------------------------
// 4) draw Camembert (fonction privée du composant)
// ---------------------------------------------------------------------------
  private drawChart(data: any[]): void {
    // Préparer deux tableaux :
    const labels: string[] = []; // contiendra les noms des pays
    const values: number[] = []; // contiendra le total de médailles

    // On boucle simplement sur chaque pays du JSON
    for (const c of data) {
      labels.push(c.country);          // ex. "Italy"
      values.push(this.getTotalMedals(c)); // ex. 96

    }

    // On crée enfin le diagramme avec Chart.js
    new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data: values }] },
      options: {
        responsive: true,
        onClick: (_e, el) => {
          if (el.length) {
            const index = el[0].index;          // part cliquée
            const id    = this.olympics[index].id;
            this.router.navigate(['/details', id]);
          }
        },
      },
    });

  }

}
