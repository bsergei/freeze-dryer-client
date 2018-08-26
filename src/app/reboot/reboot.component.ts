import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reboot',
  templateUrl: './reboot.component.html',
  styleUrls: ['./reboot.component.css']
})
export class RebootComponent implements OnInit {

  private subscription: Subscription;

  constructor(
    private api: Api,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.subscription = timer(10000, 10000)
      .pipe(switchMap(_ => {
        try {
          const res = this.api.getSensorsStatus();
          return res;
        } catch (e) {
          return undefined;
        }
      }))
      .subscribe(r => {
        if (r) {
          this.subscription.unsubscribe();
          this.router.navigate(['dashboard']);
        }
      });
  }
}
