import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api, SensorType, SensorOpt, SensorTemp } from '../services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSelect } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public sensors: Observable<SensorType[]>;
  public sensorIds: Observable<string[]>;
  
  public selectedSensorType: string;
  public selectedSensorId: string;

  public sensorTemp: Observable<SensorTemp>;

  constructor(private api: Api) { 
    this.sensors = api.getTempSensorTypes();
    this.sensorIds = api.getTempSensorIds()
      .pipe(map(t => t.map(i => i.sensor_id)));
  }

  ngOnInit() {
  }

  async onTempSensorIdSelectionChange(e: MatSelect) {
    this.selectedSensorId = e.value;

    const opts = await this.api.getTempSensorOpts()
      .toPromise();

    const selectedOpt = opts.find(opt => opt.sensor_id === e.value);
    if (selectedOpt) {
      this.selectedSensorType = selectedOpt.sensor_type;
    } else {
      this.selectedSensorType = undefined;
    }

    this.refreshTemp();
  }

  async onTempSensorTypeSelectionChange(e: MatSelect) {
    this.selectedSensorType = e.value;

    if (this.selectedSensorId && this.selectedSensorType) {
      const sensorOpt: SensorOpt = {
        sensor_id: this.selectedSensorId,
        sensor_type: this.selectedSensorType
      }

      await this.api.updateTempSensorOpt(sensorOpt).toPromise();
    }
  }

  refreshTemp() {
    this.sensorTemp = this.api.getTempSensorValue(this.selectedSensorId);
  }
}
