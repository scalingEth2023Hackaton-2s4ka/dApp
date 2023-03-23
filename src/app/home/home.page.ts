import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title> 2s4ka </ion-title>
        <div class="badge" slot="end">
          <ion-badge [color]="this.connected ? 'success' : 'danger'">{{
            this.connected ? 'connected' : 'not connected'
          }}</ion-badge>

          <ion-button *ngIf="this.connected" color="primary" (click)="this.disconnect()">Disconnect</ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div id="container">
        <ion-button *ngIf="!this.connected" (click)="this.open()">Connect</ion-button>
        <ion-text>{{ this.userAddress }}</ion-text>

        <form [formGroup]="this.form" *ngIf="this.connected" (ngSubmit)="this.createContracts()">
          <ion-item>
            <ion-label>Identifier</ion-label>
            <ion-input formControlName="identifier"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Token Address</ion-label>
            <ion-input formControlName="tokenAddress"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Lender Treasury Address</ion-label>
            <ion-input formControlName="lenderTreasury"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Vendor Treasury Address</ion-label>
            <ion-input formControlName="vendorTreasury"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label>Oracle Api URL</ion-label>
            <ion-input formControlName="oracleApiUrl"></ion-input>
          </ion-item>

          <ion-button type="submit">Submit</ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  web3Modal: any;
  provider: any;
  Web3Modal: any;
  WalletConnectProvider: any;
  // @ts-ignore
  ethersProvider: ethers.providers.Web3Provider;
  userAddress = '';

  connected = false;

  form: UntypedFormGroup = this.formBuilder.group({
    identifier: ['', [Validators.required]],
    tokenAddress: ['', [Validators.required]],
    lenderTreasury: ['', [Validators.required]],
    vendorTreasury: ['', [Validators.required]],
    oracleApiUrl: ['', [Validators.required]],
  });
  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.initWCModal();
  }

  async open() {
    try {
      this.provider = await this.web3Modal.connect();
      this.provider.on('disconnect', () => this.disconnect());
      this.connected = true;
      console.log(this.provider);
    } catch (err) {
      console.log(err);
      return;
    }
    console.log('connected....');
    this.ethersProvider = new ethers.providers.Web3Provider(this.provider);
    this.userAddress = await this.ethersProvider.getSigner().getAddress();
  }

  initWCModal() {
    // @ts-ignore
    this.Web3Modal = window.Web3Modal.default;
    // @ts-ignore
    this.WalletConnectProvider = window.WalletConnectProvider.default;

    const providerOptions = {
      walletconnect: {
        package: this.WalletConnectProvider,
        options: {
          rpc: {
            137: 'https://polygon-rpc.com',
          },
        },
      },
    };

    this.web3Modal = new this.Web3Modal({
      cacheProvider: false,
      providerOptions,
    });
  }

  disconnect() {
    this.provider.close();
    this.web3Modal.clearCachedProvider();
    this.connected = false;
    this.userAddress = '';
  }

  createContracts() {
    // TODO
    this.ethersProvider.getSigner().signMessage('asdf');
  }
}
