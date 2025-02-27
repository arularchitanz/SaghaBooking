import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormComponent} from './FormComponent/form-component'
const routes: Routes = [
  { path: '', redirectTo: 'FormComponent', pathMatch: 'full' },
  { path: '', component: FormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
