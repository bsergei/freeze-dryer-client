import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgJsonEditorModule } from 'ang-jsoneditor';

import { AppComponent } from './app.component';
import { MatModule } from './mat/mat.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { Api } from './services/api';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { CompressorWorkerDialogComponent } from './dialogs/compressor-worker-dialog/compressor-worker-dialog.component';
import { VacuumWorkerDialogComponent } from './dialogs/vacuum-worker-dialog/vacuum-worker-dialog.component';
import { HeaterWorkerDialogComponent } from './dialogs/heater-worker-dialog/heater-worker-dialog.component';
import { WorkersComponent } from './dashboard/workers/workers.component';
import { RebootComponent } from './reboot/reboot.component';
import { RecipesComponent } from './recipes/recipes.component';
import { AddRecipeDialogComponent } from './recipes/dialogs/add-recipe-dialog.component';
import { AddRecipeEntryDialogComponent } from './recipes/dialogs/add-recipe-entry-dialog.component';
import { RecipeEntriesComponent } from './recipes/recipe-entries/recipe-entries.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'recipes',
    component: RecipesComponent
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'reboot',
    component: RebootComponent
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    WorkersComponent,
    SettingsComponent,
    RecipesComponent,
    ConfirmDialogComponent,
    CompressorWorkerDialogComponent,
    VacuumWorkerDialogComponent,
    HeaterWorkerDialogComponent,
    RebootComponent,
    AddRecipeDialogComponent,
    AddRecipeEntryDialogComponent,
    RecipeEntriesComponent
  ],
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatModule,
    NgJsonEditorModule
  ],
  providers: [
    Api
  ],
  entryComponents: [
    ConfirmDialogComponent,
    CompressorWorkerDialogComponent,
    VacuumWorkerDialogComponent,
    HeaterWorkerDialogComponent,
    AddRecipeDialogComponent,
    AddRecipeEntryDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
