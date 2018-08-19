import { MatSlideToggleChange, MatDialog } from '@angular/material';
import {
    Component,
    OnDestroy
} from '@angular/core';
import { CompressorWorkerParams, VacuumWorkerParams, HeaterWorkerParams } from '@fd-model';
import { CompressorWorkerDialogComponent } from '../../dialogs/compressor-worker-dialog/compressor-worker-dialog.component';
import { VacuumWorkerDialogComponent } from '../../dialogs/vacuum-worker-dialog/vacuum-worker-dialog.component';
import { HeaterWorkerDialogComponent } from '../../dialogs/heater-worker-dialog/heater-worker-dialog.component';
import { Api } from '../../services/api';

import { timer, Observable } from 'rxjs';
import { switchMap, share, map } from 'rxjs/operators';

@Component({
    selector: 'workers',
    templateUrl: './workers.component.html',
    styleUrls: ['./workers.component.css']
})
export class WorkersComponent implements OnDestroy {

    private compressorWorkerParams: CompressorWorkerParams = {
        minCondenser1Temp: -40.0,
        minFreezerCameraTemp: -35.0,
        maxCompressorTemp: 50.0,
        debounceTime: 180
    };

    private vacuumWorkerParams: VacuumWorkerParams = {
        targetPressure: 500,
        histeresis: 100
    };

    private heaterWorkerParams: HeaterWorkerParams = {
        tempSensors: [
            {
                tempSensor: 'heater',
                targetTemperature: 35.0
            }
        ],
        histeresis: 5.0
    };

    public workerStatus$: Observable<any>;

    constructor(
        private api: Api,
        private dialog: MatDialog
    ) {
        this.workerStatus$ = timer(0, 1500)
            .pipe(
                switchMap(r => this.api.getUnitWorkerStatus()),
                map(r => {
                    const result = {};
                    for (const id of r.runningIds) {
                        result[id] = true;
                    }
                    return result;
                }),
                share());
    }

    public ngOnDestroy(): void {
    }

    public onConfigureCompressor() {
        const dialogRef = this.dialog.open(
            CompressorWorkerDialogComponent, {
                width: '350px',
                data: JSON.parse(JSON.stringify(this.compressorWorkerParams))
            });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                this.compressorWorkerParams = result;
            }
        });
    }

    public onConfigureVacuum() {
        const dialogRef = this.dialog.open(
            VacuumWorkerDialogComponent, {
                width: '350px',
                data: JSON.parse(JSON.stringify(this.vacuumWorkerParams))
            });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                this.vacuumWorkerParams = result;
            }
        });
    }

    public onConfigureHeater() {
        const dialogRef = this.dialog.open(
            HeaterWorkerDialogComponent, {
                width: '350px',
                data: JSON.parse(JSON.stringify(this.heaterWorkerParams))
            });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                this.heaterWorkerParams = result;
            }
        });
    }

    public async onAutoCompressorClick(state: MatSlideToggleChange) {
        if (state.checked) {
            await this.api.startUnitWorker('compressor', this.compressorWorkerParams);
        } else {
            await this.api.stopUnitWorker('compressor');
        }
    }

    public async onAutoVacuumClick(state: MatSlideToggleChange) {
        if (state.checked) {
            await this.api.startUnitWorker('vacuum', this.vacuumWorkerParams);
        } else {
            await this.api.stopUnitWorker('vacuum');
        }
    }

    public async onAutoHeaterClick(state: MatSlideToggleChange) {
        if (state.checked) {
            await this.api.startUnitWorker('heater', this.heaterWorkerParams);
        } else {
            await this.api.stopUnitWorker('heater');
        }
    }
}
