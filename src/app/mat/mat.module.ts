import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { 
  MatToolbarModule, 
  MatButtonModule, 
  MatCheckboxModule, 
  MatSidenavModule, 
  MatIconModule, 
  MatListModule,
  MatCardModule,
  MatGridListModule,
  MatSlideToggleModule,
  MatOptionModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatTableModule
} from '@angular/material';

@NgModule({
  imports: [
    LayoutModule,
    MatToolbarModule, 
    MatButtonModule, 
    MatCheckboxModule, 
    MatSidenavModule, 
    MatIconModule, 
    MatListModule,
    MatCardModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatOptionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule
  ],
  exports: [
    LayoutModule,
    MatToolbarModule, 
    MatButtonModule, 
    MatCheckboxModule, 
    MatSidenavModule, 
    MatIconModule, 
    MatListModule,
    MatCardModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatOptionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule
  ],
})
export class MatModule { 
}
