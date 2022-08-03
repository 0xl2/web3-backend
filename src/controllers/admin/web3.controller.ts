import { Request, Response } from 'express';
import { xgResponse } from '@/utils/api';
import { Web3Service } from '@/services/web3';

const getAvailableNetworks = (req: Request, res: Response) => {
  const networks = Web3Service.getWeb3AvailableNetworks();
  req.logger?.info('Get all available networks', networks);

  xgResponse(res, networks);
};

export const Web3Controller = {
  getAvailableNetworks,
};
