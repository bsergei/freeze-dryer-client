import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Api, SensorType, SensorOpt, SensorTemp, TempSensorTypeId } from '../services/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSelect, MatDialog } from '@angular/material';
import { ConfirmDialogComponent, ConfirmDialogData } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public sensors: Observable<SensorType[]>;
  public sensorIds: Observable<string[]>;

  public selectedSensorType: TempSensorTypeId;
  public selectedSensorId: string;

  public sensorTemp: Observable<SensorTemp>;

  constructor(
    private router: Router,
    private api: Api,
    private dialog: MatDialog) {
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
      };

      await this.api.updateTempSensorOpt(sensorOpt).toPromise();
    }
  }

  refreshTemp() {
    this.sensorTemp = this.api.getTempSensorValue(this.selectedSensorId);
  }

  resetBindings() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: <ConfirmDialogData>{ text: 'Are you sure to delete all bindings?' }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        await this.api.resetBindings();
        this.selectedSensorId = undefined;
      }
    });
  }

  public systemReboot() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: <ConfirmDialogData>{ text: 'Are you sure to reboot system?' }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        await this.api.systemReboot();
        this.router.navigate(['reboot']);
      }
    });
  }
}
