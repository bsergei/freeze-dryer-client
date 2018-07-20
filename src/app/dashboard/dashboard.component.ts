import { Component } from '@angular/core';
import { SensorTemp, Api, SensorTempConnected } from '../services/api';
import { Observable, timer } from 'rxjs';
import { map, switchMap, share } from 'rxjs/operators';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  public temperatures: Observable<SensorTempConnected[]>;
  public timestamp: Observable<Date>;

  constructor(private api: Api) {
    this.temperatures = timer(0, 10000)
      .pipe(switchMap(r => api.getSensorsStatus()),
        map(s => s.temp_sensors),
        share());
    
    this.timestamp = this.temperatures.pipe(map(r => new Date()));
  }
}
