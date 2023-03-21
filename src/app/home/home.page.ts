import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-home',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Blank </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large"></ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <strong>{{ this.isProduction }}</strong>
        <p>
          Start with Ionic
          <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components"
            >UI Components</a
          >
        </p>
      </div>
    </ion-content>
  `,
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isProduction = false;

  constructor() {}

  ngOnInit(): void {
    this.isProduction = environment.production;
  }
}
