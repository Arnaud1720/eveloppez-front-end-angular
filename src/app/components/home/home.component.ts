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
  public olympics$: Observable<Olympic[]> = of([] as Olympic[]);
  olympics: Olympic[] = [];
  numberOfCountries = 0;
  numberOfJOs = 0;

  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  private pieChart!: Chart;

  constructor(
    private olympicService: OlympicService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // On récupère l’Observable depuis le service
    this.olympics$ = this.olympicService.getOlympics();
  }

  ngAfterViewInit(): void {
    this.olympics$.subscribe((olympics: Olympic[]) => {
      if (!olympics?.length) { return; }

      this.olympics = olympics;
      this.numberOfCountries = olympics.length;
      // On délègue le calcul du nombre d’éditions au service
      this.numberOfJOs = this.olympicService.getNumberOfJOs(olympics);

      this.cd.detectChanges();
      this.drawChart(olympics);
    });
  }

  private drawChart(data: Olympic[]): void {
    const labels = data.map(c => c.country);
    // On délègue le calcul des médailles totales au service
    const values = data.map(c => this.olympicService.getTotalMedals(c));

    if (this.pieChart) {
      this.pieChart.destroy();
    }
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: { labels, datasets: [{ data: values }] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        resizeDelay: 200,
        radius: '60%',
        layout: { padding: 64 },
        plugins: {
          legend: { display: false },
          // @ts-ignore
          outlabels: {
            offset: -10,
            stretch: 40,
            autoHide: false,
            display: true,
            text: '%l',
            color: '#000',
            lineColor: '#666',
            lineWidth: 1,
            backgroundColor: 'transparent',
            padding: 12,
            font: { resizable: true, minSize: 12, maxSize: 16, weight: 'bold' }
          },
          tooltip: {
            displayColors: false,
            backgroundColor: '#00796b',
            callbacks: {
              title: () => '',
              label: ctx => `🏅 ${ctx.label}: ${ctx.parsed}`

            }
          }
        },
        onClick: (event, items) => {
          if (items.length) {
            const id = this.olympics[items[0].index].id;
            this.router.navigate(['/details', id]);
          }
        }
      },
      plugins: [Outlabels]
    });
  }

  @HostListener('window:resize')
  ifWindowResize() {
    if (this.pieChart) {
      this.pieChart.destroy();
      this.drawChart(this.olympics);
    }
  }
}
