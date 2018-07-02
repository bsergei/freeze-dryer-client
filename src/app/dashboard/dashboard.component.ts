import { Component } from '@angular/core';
import { SensorTemp, Api } from '../services/api';
import { Observable } from 'rxjs';
import { map, switchMap, zip, flatMap } from 'rxjs/operators';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  public temperature: Observable<{ sensorType: string, temperature: number, sensorId: string }[]>;

  constructor(private api: Api) {
    this.temperature = api.getTempSensorOpts()
      .pipe(flatMap(opts => 
        this.api.getTempSensorValues()
          .pipe(map(temp => { 
            return { 
              temp: temp, 
              opts: opts 
            } 
          }))))
      .pipe(map(r => {
        const res = [];
        for (let opt of r.opts) {
          const temp = r.temp.find(t => t.sensor_id === opt.sensor_id);
          const item = {
            sensorType: opt.sensor_type,
            temperature: temp ? temp.temperature : undefined,
            sensorId: opt.sensor_id
          }
          res.push(item);
        }
        return res;
      }));
  }
}
