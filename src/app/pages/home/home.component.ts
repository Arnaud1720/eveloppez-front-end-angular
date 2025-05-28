import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
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

export class HomeComponent implements OnInit, AfterViewInit  {
  public olympics$: Observable<any> = of(null);
  olympics: Olympic[] = [];
  numberOfCountries = 0;
  numberOfJOs = 0;

  constructor(private olympicService: OlympicService,private router: Router,    private cd: ChangeDetectorRef,) {}

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
  private pieChart!: Chart;
  ngAfterViewInit(): void {
    this.olympics$.subscribe((olympics) => {
      if (!olympics?.length) return;

      this.olympics = olympics;
      this.numberOfCountries = olympics.length;
      this.numberOfJOs      = new Set(olympics.flatMap((c: { participations: any[]; }) => c.participations.map(p => p.year))).size;
      this.cd.detectChanges();
      this.drawChart(olympics);
    });
  }

// ---------------------------------------------------------------------------
// 4) draw Camembert (fonction privée du composant)
// ---------------------------------------------------------------------------

  private drawChart(data: Olympic[]): void {
    const labels = data.map(c => c.country);
    const values = data.map(c => this.getTotalMedals(c));

    // Si un chart existait déjà, on le détruit
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    // On stocke la nouvelle instance
    this.pieChart = new Chart(this.pieCanvas.nativeElement,{
      type: 'pie',
      data: { labels, datasets: [{ data: values }] },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        aspectRatio:1,
        resizeDelay: 200,
        radius: '60%',
        layout: {
          padding: 64

        },


        plugins: {
          // on passe display a true si on veut ajouter les légendes
          legend: {
            display: false,
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
            offset:   -10,   // on colle un peu le texte
            stretch:  40,
            autoHide:   false,
            display:    true,
            text:       '%l',
            color:      '#000',
            lineColor:  '#666',
            lineWidth:  1,
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
              title: () => '',
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
  @HostListener('window:resize')
  onWindowResize() {
    if (this.pieChart) {
      this.pieChart.destroy();
      this.drawChart(this.olympics);
    }
  }
}
