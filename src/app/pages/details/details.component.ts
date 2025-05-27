import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OlympicService} from "../../core/services/olympic.service";
import {Olympic} from "../../core/models/Olympic";
import {Chart} from "chart.js";
import {NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";

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

export class DetailsComponent implements OnInit {
  country!: Olympic;
  totalMedals = 0;
  totalAthletes = 0;

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.olympicService.getOlympics().subscribe({
      next: data => {
        this.country = data.find((c: { id: number; }) => c.id === id)!;
        if (!this.country) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.totalMedals = this.country.participations
          .reduce((sum, p) => sum + p.medalsCount, 0);
        this.totalAthletes = this.country.participations
          .reduce((sum, p) => sum + p.athleteCount, 0);
        setTimeout(() => this.drawLineChart(), 25);
      },
      error: err => console.error(err)
    });
  }

  private drawLineChart(): void {
    const years = this.country.participations.map(p => p.year);
    const medals = this.country.participations.map(p => p.medalsCount);
    const athletes = this.country.participations.map(p => p.athleteCount);

    new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {label: 'Médailles', data: medals, borderColor: 'blue', backgroundColor: 'lightblue'},
          {label: 'Athlètes', data: athletes, borderColor: 'green', backgroundColor: 'lightgreen'}
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {display: true, text: 'Médailles et athlètes par année'}
        }
      }
    });
  }
}
