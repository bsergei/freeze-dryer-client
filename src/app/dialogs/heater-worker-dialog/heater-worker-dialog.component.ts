import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HeaterWorkerParams, TempSensorTypeId } from '@fd-model';

export interface ConfirmDialogData {
    text: string;
}

@Component({
    selector: 'heater-worker-dialog',
    templateUrl: './heater-worker-dialog.component.html',
    styleUrls: ['./heater-worker-dialog.component.css']
})
export class HeaterWorkerDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<HeaterWorkerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: HeaterWorkerParams) {
    }

    public ngOnInit() {
    }

    public deleteSensorData(sensorData: any) {
        const idx = this.data.tempSensors.findIndex(ts => ts === sensorData);
        if (idx >= 0) {
            this.data.tempSensors.splice(idx, 1);
        }
    }

    public addSensorData(sensorData: any) {
        const idx = this.data.tempSensors.findIndex(ts => ts === sensorData);
        if (idx >= 0) {
            this.data.tempSensors.splice(
                idx,
                0,
                {
                    tempSensor: undefined,
                    targetTemperature: sensorData.targetTemperature
                });
        } else {
            this.data.tempSensors.push({
                tempSensor: undefined,
                targetTemperature: 40.0
            });
        }
    }
}
