import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CompressorWorkerParams } from '@fd-model';

export interface ConfirmDialogData {
    text: string;
}

@Component({
    selector: 'compressor-worker-dialog',
    templateUrl: './compressor-worker-dialog.component.html',
    styleUrls: ['./compressor-worker-dialog.component.css']
})
export class CompressorWorkerDialogComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<CompressorWorkerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CompressorWorkerParams) {
    }

    ngOnInit() {
    }
}
