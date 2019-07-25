import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SensorsService } from '../services/sensors.service';
import { map } from 'rxjs/operators';
import { TempSensorTypeId } from '@fd-model';

interface SensorValue {
    type: string;
    value: number;
    ts: Date;
}

@Component({
    selector: 'sensors',
    templateUrl: './sensors.component.html',
    styleUrls: ['./sensors.component.css']
})
export class SensorsComponent {

    public sensors$: Observable<SensorValue[]>;
    public timestamp$: Observable<Date>;

    constructor(private sensorsService: SensorsService) {
        this.init();
    }

    private init() {
        this.sensors$ = this.sensorsService.getSensorStatuses().pipe(
            map(r => {
                const result: SensorValue[] = [];
                const ids = Object.getOwnPropertyNames(r.temp_sensors);
                ids.sort();
                for (const tsKey of ids) {
                    const ts = r.temp_sensors[tsKey as TempSensorTypeId];
                    result.push({
                        type: ts.sensor_type.display + ' (\xB0C)',
                        value: ts.temperature,
                        ts: new Date(ts.ts)
                    });
                }

                for (let ch = 0; ch < 2; ch++) {
                    result.push({
                        type: `Pressure A${ch} (mtorr)`,
                        value: r.pressure[ch],
                        ts: new Date(r.pressure_ts)
                    });
                }

                for (let ch = 0; ch < 4; ch++) {
                    result.push({
                        type: `ADC A${ch} (mV)`,
                        value: r.adcs[ch] * 1000.0,
                        ts: new Date(r.adcs_ts)
                    });
                }

                return result;
            }));
        this.timestamp$ = this.sensorsService.getSensorStatuses().pipe(map(r => r.ts));
    }
}