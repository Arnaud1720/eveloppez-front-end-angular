import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OlympicService} from "../../core/services/olympic.service";
import {Olympic} from "../../core/models/Olympic";
import {Chart} from "chart.js";
import {NgIf} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit{

  country?: Olympic;               // le pays à afficher
  totalMedals = 0;
  totalAthletes = 0;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  private readyToDraw = false;

  constructor(
    private route: ActivatedRoute,
    private olympicService: OlympicService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.olympicService.getOlympics().subscribe((data) => {
      this.country = data.find((c: { id: number; }) => c.id === id);
      if (!this.country) return;

      for (const p of this.country.participations) {
        this.totalMedals += p.medalsCount;
        this.totalAthletes += p.athleteCount;
      }

      this.readyToDraw = true;
    });
  }

  ngAfterViewInit(): void {
    if (this.readyToDraw) {
      this.drawLineChart();
    }

  }

  private drawLineChart(): void {
    const years: number[] = [];
    const medals: number[] = [];
    const athletes: number[] = [];

    for (const p of this.country!.participations) {
      years.push(p.year);
      medals.push(p.medalsCount);
      athletes.push(p.athleteCount); // ← nouvelle série de données
    }

    new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Médailles',
            data: medals,
            borderColor: 'blue',
            backgroundColor: 'lightblue',
          },
          {
            label: 'Athlètes',
            data: athletes,
            borderColor: 'green',
            backgroundColor: 'lightgreen',
          }
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Médailles et athlètes par année'
          }
        }
      },
    });
  }



}

