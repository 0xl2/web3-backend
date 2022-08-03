// @ts-ignore

import faker from 'faker';
import setupTestDB from '../../utils/setupTestDB';
import { EmailService } from '@/services';
import { Contract } from '@/models/contract.model';
import { ContractService } from '@/services/contract.service';

setupTestDB();

describe('Contract service', () => {
  describe('getContractById', () => {
    test('should return a contract', async () => {
      jest.spyOn(Contract, 'findOne').mockResolvedValue({
        _id: 10,
      } as any);

      const contract = await ContractService.getContractById('10');

      expect(contract._id).toEqual(10);
    });
  });

  describe('createContract', () => {
    test('should create a contract', async () => {
      const createSpy = jest.spyOn(Contract, 'create').mockResolvedValue({
        _id: 10,
      } as never);

      // const contract = await ContractService.createContract({
      //   name: 'Test',
      //   description: 'Test',
      // } as any);

      // expect(createSpy).toBeCalledWith({
      //   name: 'Test',
      //   description: 'Test',
      // });
    });
  });
});
