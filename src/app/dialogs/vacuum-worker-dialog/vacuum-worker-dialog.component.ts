import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { VacuumWorkerParams } from '@fd-model';

export interface ConfirmDialogData {
    text: string;
}

@Component({
    selector: 'vacuum-worker-dialog',
    templateUrl: './vacuum-worker-dialog.component.html',
    styleUrls: ['./vacuum-worker-dialog.component.css']
})
export class VacuumWorkerDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<VacuumWorkerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: VacuumWorkerParams) {
    }

    ngOnInit() {
    }
}
