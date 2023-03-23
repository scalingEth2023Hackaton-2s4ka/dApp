import { Component, OnInit, ViewChild } from '@angular/core';
import { ethers } from 'ethers';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IonModal, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title> Xscrow </ion-title>
        <div class="badge" slot="end">
          <div class="connected" *ngIf="this.connected">
            <ion-text class="connected__user-wallet">{{ this.tplUserAddress }} </ion-text>
            <ion-button color="danger" class="connected__disconnect-button" (click)="this.disconnect()">
              <ion-icon slot="icon-only" name="power-outline"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div id="container" class="content">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Create your Xscrow</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-button *ngIf="!this.connected" (click)="this.open()">Connect</ion-button>
            <form [formGroup]="this.form" *ngIf="this.connected" (ngSubmit)="this.createContracts()">
              <ion-item>
                <ion-label position="stacked">Identifier</ion-label>
                <ion-input formControlName="identifier"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Token Address</ion-label>
                <ion-input formControlName="tokenAddress"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Lender Treasury Address</ion-label>
                <ion-input formControlName="lenderTreasury"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Vendor Treasury Address</ion-label>
                <ion-input formControlName="vendorTreasury"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Oracle Api URL</ion-label>
                <ion-input formControlName="oracleApiUrl"></ion-input>
              </ion-item>

              <ion-button class="ion-margin-top" type="submit" [disabled]="!this.form.valid">Deploy</ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
      <ion-modal trigger="open-modal" (willDismiss)="onWillDismiss($event)">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Xscrow information</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="confirm()" [strong]="true">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item button detail="false">
              <ion-label>
                <h3>Owner</h3>
                <p>{{ this.deployed.owner }}</p>
              </ion-label>
            </ion-item>
            <ion-item button detail="false">
              <ion-label>
                <h3>Identifier</h3>
                <p>{{ this.deployed.id }}</p>
              </ion-label>
            </ion-item>
            <ion-item button detail="false">
              <ion-label>
                <h3>Timestamp</h3>
                <p>{{ this.deployed.timestamp | date : 'medium' }}</p>
              </ion-label>
            </ion-item>
            <ion-item button detail="false">
              <ion-label>
                <h3>Xscrow</h3>
                <p>{{ this.deployed.xscrow }}</p>
              </ion-label>
            </ion-item>
            <ion-item button detail="false">
              <ion-label>
                <h3>Oracle</h3>
                <p>{{ this.deployed.oracle }}</p>
              </ion-label>
            </ion-item>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private _factory = '0x546382Ac87F671d64dc2D3cAD47A534a456e8FFf';
  web3Modal: any;
  provider: any;
  Web3Modal: any;
  WalletConnectProvider: any;
  // @ts-ignore
  ethersProvider: ethers.providers.Web3Provider;
  userAddress = '';

  connected = false;
  tplUserAddress = '';

  form: UntypedFormGroup = this.formBuilder.group({
    identifier: ['', [Validators.required]],
    tokenAddress: ['', [Validators.required]],
    lenderTreasury: ['', [Validators.required]],
    vendorTreasury: ['', [Validators.required]],
    oracleApiUrl: ['', [Validators.required]],
  });
  // @ts-ignore
  @ViewChild(IonModal) modal: IonModal;
  deployed: any = {};

  constructor(private formBuilder: UntypedFormBuilder, private loadingCtrl: LoadingController) {}

  ngOnInit(): void {
    this.initWCModal();
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

  onWillDismiss(event: any) {
    this.form.reset();
  }
  private _setTruncatedAddress(address: string) {
    this.tplUserAddress = `${address.slice(0, 6)}....${address.slice(address.length - 4, address.length)}`;
  }
  async open() {
    try {
      this.provider = await this.web3Modal.connect();
      this.provider.on('disconnect', () => this.disconnect());
      this.connected = true;
    } catch (err) {
      return;
    }
    this.ethersProvider = new ethers.providers.Web3Provider(this.provider);
    this.userAddress = await this.ethersProvider.getSigner().getAddress();
    this._setTruncatedAddress(this.userAddress);
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
            // 5: 'https://rpc.ankr.com/eth_goerli',
            11155111: 'https://rpc.sepolia.org/',
          },
        },
      },
    };

    this.web3Modal = new this.Web3Modal({
      cacheProvider: false,
      providerOptions,
      theme: 'dark',
    });
  }

  disconnect() {
    this.web3Modal.clearCachedProvider();
    try {
      this.provider.close();
    } catch {}
    this.connected = false;
    this.userAddress = '';
  }

  private _subscribe() {
    const XscrowProduct = '(address xscrow, address oracle, uint256 timestamp )';
    const abi = [`event Deployed(address indexed owner, uint id, ${XscrowProduct} xscrowProduct_)`];

    const contract = new ethers.Contract(this._factory, abi, this.ethersProvider);

    const filter = contract.filters['Deployed'](this.userAddress);

    contract.once(filter, async (owner_: any, id_: any, product: any) => {
      this.deployed = {
        owner: owner_,
        id: id_,
        xscrow: product.xscrow,
        oracle: product.oracle,
        timestamp: product.timestamp.toNumber() * 1000,
      };
      await this.loadingCtrl.dismiss();
      await this.modal.present();
    });
  }

  async createContracts() {
    this._subscribe();
    const iface = new ethers.utils.Interface([
      'function create(string identifier_, address tokenAddress_, address lenderTreasury_, address vendorTreasury_, string apiUrl_)',
    ]);
    const encodedData = iface.encodeFunctionData('create', [
      this.form.value.identifier,
      this.form.value.tokenAddress,
      this.form.value.lenderTreasury,
      this.form.value.vendorTreasury,
      this.form.value.oracleApiUrl,
    ]);

    const loading = await this.loadingCtrl.create({
      message: 'Deploying..',
    });

    await loading.present();
    this.ethersProvider.getSigner().sendTransaction({
      to: this._factory,
      data: encodedData,
    });
  }
}
