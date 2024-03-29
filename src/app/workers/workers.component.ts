import { MatSlideToggleChange, MatDialog } from '@angular/material';
import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import { CompressorWorkerParams, VacuumWorkerParams, HeaterWorkerParams, UnitWorkerParams, UnitWorkerStatus } from '@fd-model';
import { CompressorWorkerDialogComponent } from '../dialogs/compressor-worker-dialog/compressor-worker-dialog.component';
import { VacuumWorkerDialogComponent } from '../dialogs/vacuum-worker-dialog/vacuum-worker-dialog.component';
import { HeaterWorkerDialogComponent } from '../dialogs/heater-worker-dialog/heater-worker-dialog.component';
import { Api } from '../services/api';

import { Subscription } from 'rxjs';
import { RealtimeService } from '../services/realtime.service';

@Component({
    selector: 'workers',
    templateUrl: './workers.component.html',
    styleUrls: ['./workers.component.css']
})
export class WorkersComponent implements OnDestroy, OnInit {

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

    public workerStatus: { [kind in keyof(UnitWorkerParams)]: boolean };

    private subscription: Subscription;

    constructor(
        private api: Api,
        private realtimeService: RealtimeService,
        private dialog: MatDialog
    ) {
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public async ngOnInit() {
        const lastParams = await this.api.getUnitWorkersParams();
        if (lastParams) {
            if (lastParams.compressor) {
                this.compressorWorkerParams = lastParams.compressor;
            }

            if (lastParams.vacuum) {
                this.vacuumWorkerParams = lastParams.vacuum;
            }

            if (lastParams.heater) {
                this.heaterWorkerParams = lastParams.heater;
            }
        }

        const ws = await this.api.getUnitWorkerStatus().toPromise();
        this.updateWorkerStatus(ws);

        this.subscription = this.realtimeService.getUnitWorkerStatus$()
            .subscribe(r => {
                this.updateWorkerStatus(r);
            });
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

    private updateWorkerStatus(r: UnitWorkerStatus) {
        const result = {
            compressor: false,
            vacuum: false,
            heater: false
        };
        for (const id of r.runningIds) {
            result[id] = true;
            switch (id) {
                case 'compressor':
                    this.compressorWorkerParams = r.params.compressor.p;
                    break;

                case 'vacuum':
                    this.vacuumWorkerParams = r.params.vacuum.p;
                    break;

                case 'heater':
                    this.heaterWorkerParams = r.params.heater.p;
                    break;
            }
        }

        this.workerStatus = result;
    }
}
