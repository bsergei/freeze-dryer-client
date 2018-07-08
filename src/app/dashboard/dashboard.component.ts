import { Component } from '@angular/core';
import { SensorTemp, Api, SensorTempConnected } from '../services/api';
import { Observable } from 'rxjs';
import { map, switchMap, zip, flatMap } from 'rxjs/operators';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  public temperatures: Observable<SensorTempConnected[]>;

  constructor(private api: Api) {
    this.temperatures = api.getSensorsStatus()
      .pipe(map(s => s.temp_sensors));
  }
}
