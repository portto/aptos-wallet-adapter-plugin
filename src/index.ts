import {
  NetworkName,
} from "@aptos-labs/wallet-adapter-core";
import BloctoSDK, { AptosProviderInterface as IBloctoAptos } from '@blocto/sdk';
import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import { Types } from "aptos";

interface BloctoWindow extends Window {
  bloctoAptos?: IBloctoAptos;
}

declare const window: BloctoWindow;

export const BloctoWalletName = "Blocto" as WalletName<"Blocto">;

export interface BloctoWalletAdapterConfig {
  network?: NetworkName.Mainnet | NetworkName.Testnet
  bloctoAppId: string;
}

export const APTOS_NETWORK_CHAIN_ID_MAPPING = {
  // MAINNET
  [NetworkName.Mainnet]: 1,
  // TESTNET
  [NetworkName.Testnet]: 2
};

export class BloctoWallet implements AdapterPlugin {
  readonly name = BloctoWalletName;
  readonly url =
    'https://blocto.app'
  readonly icon =
    'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0ibTE5LjQ4MzggMTUuMjQ5Yy4yNzY5IDAgLjUwNDguMjA5OS41MzI1LjQ3ODhsLjAwMjIuMDQyOS0uMDA0My4xMTQyYy0uMzM1IDMuOTgzMy0zLjc5MDQgNy4xMTUxLTguMDAzNyA3LjExNTEtNC4xNzA2IDAtNy41OTg2My0zLjA2ODctNy45OTI2OS02Ljk5NDZsLS4wMTYzOC0uMTgxMS0uMDAxMDYtLjA1MzIuMDAxNzgtLjAzOThjLjAyNTk4LS4yNzA2LjI1NDg3LS40ODIzLjUzMjg5LS40ODIzeiIgZmlsbD0iI2FmZDhmNyIvPjxwYXRoIGQ9Im00LjMwMDA5IDFjMy43ODc1NSAwIDYuODI1ODEgMi45MDkxMSA2LjgyNTgxIDYuNTAyNzd2Ni4zNTM0M2MtLjAwMDQuMjkxNy0uMjM5Mi41Mjg0LS41MzQuNTI4OGwtNi4wNTc1OC4wMDMyYy0uMjk1MTEuMDAwNy0uNTM0MzItLjIzNjEtLjUzNDMyLS41Mjc4bC4wMDAzNi0xMi41NjM3NWMwLS4xNTE0OS4xMTQyNi0uMjc2MjIuMjYxOTktLjI5NDE4eiIgZmlsbD0iIzE4MmE3MSIvPjxwYXRoIGQ9Im0xOS42OTIxIDEyLjIzODMuMDM4OC4xMjgzLS4wMjg4LS4wODQ2Yy4xNjE2LjQ1MzQuMjY2Ni43NzY5LjMxNTMgMS4zNDEzLjAzMzUuMzg3OS0uMjU3LjcyODktLjY0ODUuNzYybC0uMDMwMy4wMDIyLTMuMDgwOS4wMDA3Yy0yLjEwNjMgMC0zLjgyMDQtMS40NzQxLTMuODc1Mi0zLjU0MjNsLS4wMDE0LS4xMDIxdi0zLjQ2NThjMC0uMjAxNTMuMTY5NC0uMzY5NTkuMzc0MS0uMzYwMDcgMy4zMDAzLjE1NDY2IDUuOTk3OCAyLjM0MTUxIDYuOTM2OSA1LjMyMDM3eiIgZmlsbD0iIzM0ODVjNCIvPjwvZz48L3N2Zz4=';

  provider: IBloctoAptos | undefined =
    typeof window !== "undefined" ? window.bloctoAptos : undefined;

  protected _network: NetworkName.Mainnet | NetworkName.Testnet

  constructor({
    network = NetworkName.Mainnet,
    bloctoAppId
  }: BloctoWalletAdapterConfig) {
    const sdk = new BloctoSDK({
      aptos: {
        chainId: APTOS_NETWORK_CHAIN_ID_MAPPING[network]
      },
      appId: bloctoAppId
    });

    this.provider = sdk.aptos
    this._network = network;
  }

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) throw `${BloctoWalletName} Address Info Error`;
      if (!accountInfo.address) throw `${BloctoWalletName} address null`;
      if (!accountInfo.publicKey) throw `${BloctoWalletName} publicKey null`;
      if (!accountInfo.minKeysRequired) throw `${BloctoWalletName} minKeysRequired null`;
      return {
        address: accountInfo.address,
        publicKey: accountInfo.publicKey,
        minKeysRequired: accountInfo.minKeysRequired
      };
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    const response = await this.provider?.publicAccount;
    if (!response) throw `${BloctoWalletName} Account Error`;
    if (!response.address) throw `${BloctoWalletName} address null`;
    if (!response.publicKey) throw `${BloctoWalletName} publicKey null`;
    if (!response.minKeysRequired) throw `${BloctoWalletName} minKeysRequired null`;
    return {
      address: response.address,
      publicKey: response.publicKey,
      minKeysRequired: response.minKeysRequired
    };
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect();
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      try {
        const provider = this.provider;
        const response = await provider?.signAndSubmitTransaction(transaction, options);
        if (response) {
          return { hash: response.hash };
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error: any) {
        throw new Error(error.message || error);
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${BloctoWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.signMessage(message);
      if (response) {
        return response;
      } else {
        throw `${BloctoWalletName} Sign Message failed`;
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.network();
      if (!response) throw `${BloctoWalletName} Network Error`;
      const name = response.name as unknown
      return {
        name: name as NetworkName,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      // not supported yet
      return Promise.resolve();
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      // not supported yet
      return Promise.resolve();
    } catch (error: any) {
      console.log(error);
      const errMsg = error.message;
      throw errMsg;
    }
  }
}
