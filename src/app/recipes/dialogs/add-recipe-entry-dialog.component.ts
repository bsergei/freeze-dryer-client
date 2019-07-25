import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface AddRecipeEntryDialogData {
  title?: string;
  name?: string;
}

@Component({
  selector: 'add-recipe-dialog',
  template: `<h2 mat-dialog-title>{{title}}</h2>
<mat-dialog-content>
<form class="example-form">
  <mat-form-field>
    <input matInput placeholder="Step Name" [(ngModel)]="data.name" name="name">
  </mat-form-field>
</form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>`
})
export class AddRecipeEntryDialogComponent {

  public title: string;

  constructor(public dialogRef: MatDialogRef<AddRecipeEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRecipeEntryDialogData) {
      this.title = data.title || 'Add Recipe';
  }
}
