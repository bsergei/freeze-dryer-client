import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface AddRecipeDialogData {
  title?: string;
  name: string;
}

@Component({
  selector: 'add-recipe-dialog',
  template: `<h2 mat-dialog-title>{{data.title}}</h2>
<mat-dialog-content>
<form class="example-form">
  <mat-form-field>
    <input matInput placeholder="Recipe Name" [(ngModel)]="data.name" name="recipeName">
  </mat-form-field>
</form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>`
})
export class AddRecipeDialogComponent {
  constructor(public dialogRef: MatDialogRef<AddRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRecipeDialogData) {
      if (!data.title) {
        data.title = 'Add Recipe';
      }
  }
}
