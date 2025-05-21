import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {OlympicService} from "../core/services/olympic.service";
import {Olympic} from "../core/models/Olympic";
import {Chart} from "chart.js";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit{

  country?: Olympic;               // le pays à afficher
  totalMedals = 0;
  totalAthletes = 0;

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private olympicService: OlympicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) Récupérer l’id passé dans l’URL
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // 2) Récupérer les données depuis le service
    this.olympicService.getOlympics().subscribe((data) => {
      if (!data) { return; }

      // 3) Trouver le pays correspondant
      this.country = data.find((c: Olympic) => c.id === id);

      if (!this.country) {                 // id inconnu → retour accueil
        this.router.navigateByUrl('/');
        return;
      }

      // 4) Calculs simples
      for (const p of this.country.participations) {
        this.totalMedals   += p.medalsCount;
        this.totalAthletes += p.athleteCount;
      }

      // 5) Dessiner le line chart
      this.drawLineChart();
    });
  }

  private drawLineChart(): void {
    const years: number[] = [];
    const medals: number[] = [];

    for (const p of this.country!.participations) {
      years.push(p.year);
      medals.push(p.medalsCount);
    }

    new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{ label: 'Médailles', data: medals }],
      },
      options: { responsive: true },
    });
  }
}
