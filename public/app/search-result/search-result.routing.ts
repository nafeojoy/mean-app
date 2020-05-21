import { Routes, RouterModule } from '@angular/router';

import { SearchResultComponent } from './search-result.component';

const routes: Routes = [
  { path: '', component: SearchResultComponent }
];

export const routing = RouterModule.forChild(routes);