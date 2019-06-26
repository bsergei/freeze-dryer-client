import { Component, OnDestroy } from '@angular/core';
import {
  Api,
  SensorsStatus,
  GpioStatus,
  TempSensorTypeId
} from '../services/api';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material';

interface SensorValue {
  type: string;
  value: number;
  ts: Date;
}

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  public sensorStatuses$: Observable<SensorsStatus>;
  public sensors$: Observable<SensorValue[]>;
  public timestamp$: Observable<Date>;

  public relays: Promise<GpioStatus[]>;
  public timestampRelays$: Observable<Date>;
  public gpioValues$ = new BehaviorSubject<{ [id: string]: boolean }>({});

  private gpioValuesSubscription: Subscription;

  public get gpioValues() {
    return this.gpioValues$.value;
  }

  constructor(
    private api: Api) {
    this.init();
  }

  private async init() {
    this.sensorStatuses$ =
        this.api.getSensorsStatus$().pipe(share());

    this.sensors$ = this.sensorStatuses$.pipe(
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
    this.timestamp$ = this.sensorStatuses$.pipe(map(r => r.ts));

    this.relays = this.api.getGpios().toPromise();
    await this.relays;

    if (this.gpioValuesSubscription) {
      this.gpioValuesSubscription.unsubscribe();
    }

    this.gpioValuesSubscription = this.sensorStatuses$.subscribe(v => {
      const result: { [id: string]: boolean } = {};
      for (const pinConfig of v.gpios) {
        result[pinConfig.id] = pinConfig.value;
      }
      this.gpioValues$.next(result);
    });

    this.timestampRelays$ = this.gpioValues$.pipe(map(r => new Date()));
  }

  async onRelayClick(state: MatSlideToggleChange, relay: GpioStatus) {
    await this.api.gpioSet(relay.port, state.checked).toPromise();
  }

  public refresh() {
    this.init();
  }

  public ngOnDestroy() {
    if (this.gpioValuesSubscription) {
      this.gpioValuesSubscription.unsubscribe();
    }
  }
}
