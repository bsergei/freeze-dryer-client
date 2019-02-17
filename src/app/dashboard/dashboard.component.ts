import { Component, OnDestroy } from '@angular/core';
import {
  Api,
  SensorsStatus,
  GpioStatus
} from '../services/api';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material';

interface SensorValue {
  type: string;
  value: number;
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

    this.sensors$ = this.sensorStatuses$.pipe(map(r => {
      const result: SensorValue[] = [];
      for (const ts of r.temp_sensors) {
        result.push({
          type: ts.sensor_type.display + ' (\xB0C)',
          value: ts.temperature
        });
      }

      result.push({
        type: 'Pressure A0 (mtorr)',
        value: r.pressure
      });

      result.push({
        type: 'Pressure A1 (mtorr)',
        value: r.pressure2
      });

      result.push({
        type: 'Pressure A2 (mtorr)',
        value: r.pressure3
      });

      result.push({
        type: 'Pressure A3 (mtorr)',
        value: r.pressure4
      });

      result.push({
        type: 'A0',
        value: r.adcs[0]
      });

      result.push({
        type: 'A1',
        value: r.adcs[1]
      });

      result.push({
        type: 'A2',
        value: r.adcs[2]
      });

      result.push({
        type: 'A3',
        value: r.adcs[3]
      });

      return result;
    }));
    this.timestamp$ = this.sensorStatuses$.pipe(map(r => r.asOfDate));

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
