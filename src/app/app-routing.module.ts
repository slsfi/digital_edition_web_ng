import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'content',
    loadChildren: () => import('./pages/content/content.module').then( m => m.ContentPageModule)
  },
  {
    path: 'publication-cover',
    loadChildren: () => import('./pages/cover/cover.module').then( m => m.CoverPageModule)
  },
  {
    path: 'downloads',
    loadChildren: () => import('./pages/downloads/downloads.module').then( m => m.DownloadsPageModule)
  },
  {
    path: 'publications',
    loadChildren: () => import('./pages/editions/editions.module').then( m => m.EditionsPageModule)
  },
  {
    path: 'elastic-search',
    loadChildren: () => import('./pages/elastic-search/elastic-search.module').then( m => m.ElasticSearchPageModule)
  },
  {
    path: 'epub',
    loadChildren: () => import('./pages/epub/epub.module').then( m => m.EpubModule)
  },
  {
    path: 'featured',
    loadChildren: () => import('./pages/featured-facsimile/featured-facsimile.module').then( m => m.FeaturedFacsimilePageModule)
  },
  {
    path: 'publication-foreword',
    loadChildren: () => import('./pages/foreword/foreword.module').then( m => m.ForewordPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabledBlocking' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
