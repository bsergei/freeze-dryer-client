import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface AddRecipeDialogData {
  name: string;
}

@Component({
  selector: 'add-recipe-dialog',
  template: `<h2 mat-dialog-title>Add Recipe</h2>
<mat-dialog-content>
<form class="example-form">
  <mat-form-field>
    <input matInput placeholder="Recipe Name" [(ngModel)]="data.name" name="recipeName">
  </mat-form-field>
</form>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button mat-dialog-close>Cancel</button>
  <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>`
})
export class AddRecipeDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AddRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRecipeDialogData) {
    }

  ngOnInit() {
  }
}
