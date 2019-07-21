import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface AddRecipeEntryDialogData {
  id: string;
  name: string;
}

@Component({
  selector: 'add-recipe-dialog',
  template: `<h2 mat-dialog-title>Add Recipe</h2>
<mat-dialog-content>
<form class="example-form">
  <mat-form-field>
    <input matInput placeholder="Id" [(ngModel)]="data.id" name="id">
  </mat-form-field>
  <mat-form-field>
    <input matInput placeholder="Name" [(ngModel)]="data.name" name="name">
  </mat-form-field>
</form>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button mat-dialog-close>Cancel</button>
  <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>`
})
export class AddRecipeEntryDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AddRecipeEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRecipeEntryDialogData) {
    }

  ngOnInit() {
  }
}
