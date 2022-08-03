import { NullableType } from 'joi';
import httpStatus from 'http-status';
import { Game } from '@/models';
import { ApiError } from '@/utils/api';
import { Logger } from '@/config/logger';
import { IOptions } from '@/types/global';
import { web3Clients, Web3Service } from '..';
import { Wallet } from '@ethersproject/wallet';
import { walletManager } from '@/services';
import { BigNumber } from '@ethersproject/bignumber';
import { CHAIN_TYPE, Config } from '@/config/config';
import { GameToken } from '@/models/gameToken.model';
import { MintedNFTSService } from '@/services/mintedNFTS.service';
import { getGameTokenMetadataBaseUrl, getGameTokenUrl } from '@/utils/storage';
import { BurnTokenWeb3, ContractWeb3, ITransaction, IWeb3Client, MintWeb3 } from '../types';
import { ImmutableXClient as ImxClient, MintableERC721TokenType, ProjectResult } from '@imtbl/imx-sdk';
import { ethers } from 'ethers';

const IMX_COMPONENT = 'imx-bulk-mint-script';

const serializeNft = (nft) => ({
  id: nft?.id,
  network: CHAIN_TYPE.IMMUTABLE,
  collection: nft?.collection,
  created_at: new Date(nft?.created_at).toISOString(),
  image_url: nft?.image_url,
  metadata: nft?.metadata,
  marketUrl: nft?.marketUrl,
  name: nft?.name,
  status: nft?.status,
  token_address: nft?.token_address,
  token_id: nft?.token_id,
  updated_at: new Date(nft?.updated_at).toISOString(),
  uri: nft?.uri,
  user: nft?.user,
});

export class ImmutableXClient implements IWeb3Client {
  private async waitForTransaction(promise: Promise<string>, chain: string) {
    const txId = await promise;
    const { provider } = await Web3Service.getProvider(chain);
    const receipt = await provider.waitForTransaction(txId);
    if (receipt.status === 0) {
      throw new Error('Transaction rejected');
    }
    Logger.info(`${IMX_COMPONENT}, Transaction Mined: ${receipt.blockNumber}`);
    return receipt;
  }

  private async ensureCollectionExists(
    minter: ImxClient,
    signer: Wallet,
    gameId: string,
    gameTokenId: string,
    gameContractAddress: string
  ) {
    let collection;

    try {
      collection = await minter.getCollection({
        address: gameContractAddress,
      });
    } catch (err) {
      console.log(err);
    }

    if (collection) return;

    const game = await Game.findOne({
      shortGameId: gameId,
    });

    let project: Partial<ProjectResult>;
    if (game && game.meta.immutableXProjectId) {
      try {
        project = await minter.getProject({
          project_id: game.meta.immutableXProjectId,
        });
      } catch (err) {
        throw new ApiError(httpStatus.BAD_REQUEST, err);
      }
    }

    if (project) {
      if (project.collection_remaining === 0) {
        Logger.error(`ImmutableX project collection limit reached for game ${game.title}. NFT was not minted.`);
        throw new ApiError(httpStatus.BAD_REQUEST, 'Collection limit reached for immutableX');
      }
    } else {
      Logger.info(`ImmutableX project for game ${game.title} didn't exist. Creating a new one.`);

      project = await minter.createProject({
        name: game.title,
        company_name: game.title,
        contact_email: Config.contactEmail,
      });

      Logger.info(`ImmutableX project for game ${game.title} created. Details: ${JSON.stringify(project)}`);

      await Game.updateOne(
        {
          shortGameId: gameId,
        },
        {
          $set: {
            meta: {
              immutableXProjectId: project.id,
            },
          },
        }
      );
    }

    const gameToken = await GameToken.findOne({
      gameId: game.id,
      shortTokenId: gameTokenId,
    });

    Logger.info(`ImmutableX collection didn't exist for gameToken ${gameToken.name}:${gameToken.id}. Creating a new one.`);

    const newCollection = await minter.createCollection({
      name: gameToken.name,
      contract_address: gameContractAddress,
      owner_public_key: signer.publicKey,
      project_id: project.id,
      icon_url: game.imageUrl,
      collection_image_url: gameToken.imageUrl,
      metadata_api_url: getGameTokenMetadataBaseUrl('immutable', gameId, gameTokenId),
    });

    Logger.info(
      `ImmutableX collection for gameToken ${gameToken.name}:${gameToken.id} created. Details: ${JSON.stringify(
        newCollection
      )}`
    );
  }

  private async getMinter(contract: ContractWeb3) {
    const { provider, ethers } = await Web3Service.getProvider(contract.chainName);
    const wallet = walletManager.getWalletByAddress(contract.owner);
    const signer = new ethers.Wallet(wallet.privateKey, provider);

    const minter = await ImxClient.build({
      publicApiUrl: Config.immutableX.publicApiUrl,
      signer,
      enableDebug: Config.immutableX.enableDebug,
      starkContractAddress: Config.immutableX.starkAddress,
      registrationContractAddress: Config.immutableX.registrationAddress,
    });

    Logger.info(`${IMX_COMPONENT}: MINTER REGISTRATION`);
    const registerImxResult = await minter.registerImx({
      etherKey: minter.address,
      starkPublicKey: minter.starkPublicKey,
    });

    if (registerImxResult.tx_hash === '') {
      Logger.info(`${IMX_COMPONENT}, Minter registered, continuing...`);
    } else {
      Logger.info(`${IMX_COMPONENT}, Waiting for minter registration...`);
      await this.waitForTransaction(Promise.resolve(registerImxResult.tx_hash), contract.chainName);
    }

    Logger.info(`${IMX_COMPONENT}, OFF-CHAIN MINT NFTS`);

    return { minter, signer };
  }

  public async start() {}

  public async getAssets(gameContract: ContractWeb3, address: string, options: NullableType<IOptions>) {
    const { minter } = await this.getMinter(gameContract);
    const { client, chain } = await Web3Service.getChainInfo(gameContract.chainName);
    const web3Market = Web3Service.getWeb3MarketPlace(client as web3Clients);
    const nfts = await Web3Service.getAllPaginatedResults(minter.getAssets, {
      collection: gameContract.address,
      order_by: options.orderBy,
      page_size: options.page,
      direction: options.sortBy,
      user: address,
    });

    const result = nfts?.map((nft) => {
      const tokenIdDecimal = parseInt(nft.token_id).toString();
      const marketUrl = web3Market.getAssetUrl(chain, gameContract.address, tokenIdDecimal);
      return serializeNft({ ...nft, marketUrl });
    });

    return result;
  }

  public async mint(params: MintWeb3, contract: ContractWeb3): Promise<ITransaction> {
    const { minter, signer } = await this.getMinter(contract);

    await this.ensureCollectionExists(minter, signer, params.gameId, params.gameTokenId_, contract.address);

    const web3Market = Web3Service.getWeb3MarketPlace('immutable');

    //TODO: will not work on scale
    const immutableXTokens = await MintedNFTSService.getLatestMintedNFT(
      {
        gameId: params.gameId,
        chainName: contract.chainName,
      },
      {
        createdAt: -1,
      }
    );

    const latestTokenId = (+immutableXTokens[0]?.tokenId || 0) + 1;

    const tokenMetadataUrl = getGameTokenUrl(
      'immutable',
      params.gameId.toString(),
      params.gameTokenId_.toString(),
      latestTokenId.toString()
    );

    Logger.info(`Minting with metadata url: ${tokenMetadataUrl}`);
    const result = await minter.mintV2([
      {
        users: [
          {
            etherKey: params.to_.toLowerCase(),
            tokens: [
              {
                id: latestTokenId.toString(),
                blueprint: `${latestTokenId}:${tokenMetadataUrl}`,
              },
            ],
          },
        ],
        contractAddress: contract.address,
      },
    ]);

    Logger.info(`mint request sent at transaction id: ${result.results[0].tx_id}`);
    return {
      tokenId: latestTokenId.toString(),
      hash: result.results[0].tx_id.toString(),
      url: web3Market.getAssetUrl(contract.chainName, contract.address, latestTokenId.toString()),
    };
  }

  public async burnToken(params: BurnTokenWeb3, contract: ContractWeb3) {
    const { minter } = await this.getMinter(contract);
    const result = await minter.burn({
      sender: params.from_,
      token: {
        type: MintableERC721TokenType.MINTABLE_ERC721,
        data: {
          id: params.id_,
          tokenAddress: contract.address,
          blueprint: '',
        },
      },
      quantity: BigNumber.from(params.amount_),
    });

    Logger.info(`burn request sent at transfer id: ${result.transfer_id}`);
    return null;
  }

  public instance() {
    return ethers;
  }
}
