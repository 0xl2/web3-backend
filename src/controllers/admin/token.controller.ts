import { ContractService, GameTokenService, AuthTokenService, PlayerService } from '@/services';
import { groupBy } from '@/utils';
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { wrapRequestAsync, xgResponse } from '@/utils/api';
import { IGameToken } from '@/models/gameToken.model';
import { checkDocExists } from '@/utils/helpers';
import { Web3Service } from '@/services/web3';
import { CONTRACT_TYPE } from '@/models/contract.model';

// GET
const getToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const id = req.user._id;
  const token = await AuthTokenService.getToken(id);

  req.logger?.info('Token was removed successfully', token);
  xgResponse(res, token, httpStatus.OK);
});

// POST
const mintToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game } = req;
  const { address, email, externalId, amount, gameTokenId, attributes, imageUrl } = req.body;

  let player;
  const playerParam = email || externalId;
  const filter = { [(email && 'email') || (externalId && 'externalPlayerId')]: playerParam };

  const gameToken = await GameTokenService.getGameTokenById(gameTokenId);
  req.logger?.info(`Mint with gameTokenId - ${gameTokenId} amount - ${amount} contract details`);

  if (address) {
    player = await PlayerService.getPlayerByAddress(address, gameToken.chainName);
  } else {
    player = await PlayerService.getPlayerQuery(filter);
  }

  checkDocExists(player, 'Player does not exist', httpStatus.BAD_REQUEST);
  await GameTokenService.mintToken(game, gameToken, player, {
    amount,
    imageUrl,
    attributes,
  });

  xgResponse(res, {}, httpStatus.CREATED);
});

const burnToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game } = req;
  const { address, amount, shortTokenId } = req.body;

  req.logger?.info(`Burn token with address - ${address} amount - ${amount} game token id - ${shortTokenId}`);
  const gameToken = await GameTokenService.getGameTokenByTokenId(shortTokenId, game._id.toString());
  const contract = await ContractService.getContractBy({
    chainName: gameToken.chainName,
    type: CONTRACT_TYPE.ERC721,
  });

  const web3Client = Web3Service.getWeb3Client('default');
  req.logger?.info(`Burn token contract - ${contract} chain - ${gameToken.chainName} contract, chain detail`);
  await web3Client.burnToken(
    {
      from_: address,
      id_: shortTokenId,
      amount_: amount,
    },
    contract
  );

  xgResponse(res, {}, httpStatus.CREATED);
});

const burnBatchToken = wrapRequestAsync(async (req: Request, res: Response) => {
  const { game } = req;
  const { tokenIds } = req.body;

  req.logger?.info(`Get tokens with tokenIds - ${JSON.stringify(tokenIds)} gameId - ${game._id}`);
  const gameTokens = await GameTokenService.getGameTokensByTokenIds(
    tokenIds.map((q) => q.shortTokenId),
    game._id.toString()
  );

  const contracts = await ContractService.getContractsByChainNames(gameTokens.map((gt) => gt.chainName));

  const contractsMap = {};
  const tokensByChainNameMap = {};
  const tokensByGameTokenIdMap = {};

  contracts.map((contract) => {
    contractsMap[contract.chainName] = contract;
  });

  tokenIds.map((token) => {
    tokensByGameTokenIdMap[token.shortTokenId] = token;
  });

  req.logger?.info('Get tokens with chain', gameTokens);
  const gameTokensByChain = groupBy<IGameToken>(gameTokens, 'chainName');

  Object.entries(gameTokensByChain).map(([chainName, gameTokens]) => {
    tokensByChainNameMap[chainName] = tokensByChainNameMap[chainName] || [];
    tokensByChainNameMap[chainName].push(gameTokens.map((gt) => tokensByGameTokenIdMap[gt._id.toString()]));
  });

  const bulkBurnPromises = [];

  Object.entries(tokensByChainNameMap).forEach(async ([, tokens]) => {
    const amounts_ = [];

    (tokens as any).forEach((q) => {
      amounts_.push(q.amount);
    });
  });

  await Promise.all(bulkBurnPromises);

  xgResponse(res, {}, httpStatus.CREATED);
});

export const TokenController = {
  getToken,
  mintToken,
  burnToken,
  burnBatchToken,
};
