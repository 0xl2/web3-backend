import { Logger } from '@/config/logger';
import { IContract } from '@/models/contract.model';
import { Web3Service } from '..';

export type Listener = (...args: any[]) => void;

const ALL_EVENTS = '*';

export class EventsManager {
  private bindings = {};

  public async on(event: string, contract: IContract, txHash: string, listener: Listener) {
    if (!this.bindings[contract.address] || !this.bindings[contract.address][event]) {
      await this.initializeListener(event, contract);
    }

    this.addListener(event, contract.address, txHash, listener);
  }

  private addListener(event: string, address: string, txHash: string, listener: Listener) {
    this.bindings[address] = this.bindings[address] || {};
    this.bindings[address][event] = this.bindings[address][event] || {};

    if (txHash !== null) {
      this.bindings[address][event][txHash] = listener;
    } else {
      listener();
    }
  }

  private removeListener(event: string, address: string, txHash: string) {
    delete this.bindings[address][event][txHash];
  }

  private async initializeListener(event: string, contract: IContract) {
    const ethContract = await Web3Service.getContract(contract);

    return await ethContract.on(event, (...args) => {
      const txHash = args[args.length - 1].transactionHash;
      Logger.info(`${contract.address}:${event}:${txHash} was fired with args: ${JSON.stringify(args)}`);

      if (this.bindings[contract.address][event][txHash]) {
        this.bindings[contract.address][event][txHash](...args);
        this.removeListener(event, contract.address, txHash);
      } else if (this.bindings[contract.address][event][ALL_EVENTS]) {
        const listeners = this.bindings[contract.address][event];

        for (const listener of listeners) {
          listener(...args);
        }

        // Remove all listeners
        this.bindings[contract.address][event][ALL_EVENTS] = [];
      }
    });
  }
}

export const eventsManager = new EventsManager();
