import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart, registerables } from 'chart.js';
import {Olympic} from "../../core/models/Olympic";
import {Router} from "@angular/router";
// @ts-ignore
import Outlabels from '@energiency/chartjs-plugin-piechart-outlabels';

Chart.register(...registerables, Outlabels);

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
  }
)

export class HomeComponent implements OnInit {
  public olympics$: Observable<any> = of(null);
  olympics: Olympic[] = [];
  numberOfCountries = 0;
  numberOfJOs = 0;

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

  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.olympics$.subscribe((olympics) => {

      if (olympics) {


        this.olympics = olympics;

        this.numberOfCountries = olympics.length;

        const years = new Set<number>();
        for (const country of olympics) {
          for (const participation of country.participations) {
            years.add(participation.year);
          }
        }
        this.numberOfJOs = years.size;
        this.drawChart(olympics);
      }
    });
  }

// ---------------------------------------------------------------------------
// 4) draw Camembert (fonction privée du composant)
// ---------------------------------------------------------------------------
  private drawChart(data: Olympic[]): void {
    const labels = data.map(c => c.country);
    const values = data.map(c => this.getTotalMedals(c));

    new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data: values }] },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        radius: '60%',
        layout: { padding: 64 },

        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 30,
              padding: 25,
              font: {
                size: 16,
                weight: 'lighter'
              },
              color: '#000'
            }
          },
          // @ts-ignore
          outlabels: {
            display:    true,
            text:       '%l',
            color:      '#000',
            lineColor:  '#666',
            lineWidth:  1,
            stretch:    80,
            backgroundColor: 'transparent',
            padding:    12,
            font: {
              resizable: true,
              minSize:   12,
              maxSize:   16,
              weight:    'bold'
            }
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: ctx => `🏅 ${ctx.label}: ${ctx.parsed}`
            }
          }
        },

        onClick: (_e, items) => {
          if (items.length) {
            const id = this.olympics[items[0].index].id;
            this.router.navigate(['/details', id]);
          }
        }
      },

      plugins: [ Outlabels ]
    });
  }




}
