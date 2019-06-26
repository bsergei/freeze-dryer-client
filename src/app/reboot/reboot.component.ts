import { Component, OnInit, OnDestroy } from '@angular/core';
import { Api } from '../services/api';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reboot',
  templateUrl: './reboot.component.html',
  styleUrls: ['./reboot.component.css']
})
export class RebootComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private subscriptionT: Subscription;
  private t: number;

  constructor(
    private api: Api,
    private router: Router) {
  }

  ngOnInit() {
    this.t = 0;
    this.subscription = timer(10000, 10000)
      .subscribe(async () => {
        try {
          const res = await this.api.getSensorsStatus().toPromise();
          this.subscription.unsubscribe();
          this.router.navigate(['dashboard']);
          return res;
        } catch (e) {
          return undefined;
        }
      });

      this.subscriptionT = timer(1000, 1000)
        .subscribe(() => {
          this.t++;
        });
  }

  public ngOnDestroy(): void {
    if (this.subscriptionT) {
      this.subscriptionT.unsubscribe();
    }
  }
}
