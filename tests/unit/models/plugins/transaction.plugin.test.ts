import { model } from 'mongoose';
import { PaginatedModel } from '@/models/types';
import { Model, Schema } from 'mongoose';
import setupTestDB from '@/../tests/utils/setupTestDB';
import { transaction } from '@/models/plugins';

interface IProject {
  name: string;
}

interface ProjectModel extends Model<IProject>, PaginatedModel<IProject> {
  transaction(cb: () => Promise<unknown>): Promise<unknown>;
}

const projectSchema = new Schema<IProject, ProjectModel>({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.plugin(transaction);

const Project = model<IProject, ProjectModel>('Project', projectSchema, 'Project', true);

setupTestDB();

describe('transaction plugin', () => {
  test('should complete the transaction if no error occurs', async () => {
    const tx = {
      startTransaction: () => {},
      commitTransaction: () => {},
      endSession: () => {},
      abortTransaction: () => {},
    };

    const txSpy = jest.spyOn(Project, 'startSession').mockResolvedValue(tx as any);
    const txStartSpy = jest.spyOn(tx, 'startTransaction');
    const txCommitSpy = jest.spyOn(tx, 'commitTransaction');
    const txEndSpy = jest.spyOn(tx, 'endSession');
    const txAbortSpy = jest.spyOn(tx, 'abortTransaction');

    await Project.transaction(async () => {});

    expect(txSpy).toBeCalledTimes(1);
    expect(txStartSpy).toBeCalledTimes(1);
    expect(txCommitSpy).toBeCalledTimes(1);
    expect(txEndSpy).toBeCalledTimes(1);
    expect(txAbortSpy).toBeCalledTimes(0);
  });

  test('should complete the transaction and return the value', async () => {
    const tx = {
      startTransaction: () => {},
      commitTransaction: () => {},
      endSession: () => {},
      abortTransaction: () => {},
    };

    const txSpy = jest.spyOn(Project, 'startSession').mockResolvedValue(tx as any);
    const txStartSpy = jest.spyOn(tx, 'startTransaction');
    const txCommitSpy = jest.spyOn(tx, 'commitTransaction');
    const txEndSpy = jest.spyOn(tx, 'endSession');
    const txAbortSpy = jest.spyOn(tx, 'abortTransaction');

    const txResult = await Project.transaction(async () => {
      return 10;
    });

    expect(txSpy).toBeCalledTimes(1);
    expect(txStartSpy).toBeCalledTimes(1);
    expect(txCommitSpy).toBeCalledTimes(1);
    expect(txEndSpy).toBeCalledTimes(1);
    expect(txAbortSpy).toBeCalledTimes(0);
    expect(txResult).toEqual(10);
  });

  test('should throw an error and abort the transaction without committing', async () => {
    const tx = {
      startTransaction: () => {},
      commitTransaction: () => {},
      endSession: () => {},
      abortTransaction: () => {},
    };

    const txSpy = jest.spyOn(Project, 'startSession').mockResolvedValue(tx as any);
    const txStartSpy = jest.spyOn(tx, 'startTransaction');
    const txCommitSpy = jest.spyOn(tx, 'commitTransaction');
    const txEndSpy = jest.spyOn(tx, 'endSession');
    const txAbortSpy = jest.spyOn(tx, 'abortTransaction');

    const txResult = Project.transaction(async () => {
      throw new Error('test error');
    });

    await expect(txResult).rejects.toThrow(new Error('test error'));

    expect(txSpy).toBeCalledTimes(1);
    expect(txStartSpy).toBeCalledTimes(1);
    expect(txCommitSpy).toBeCalledTimes(0);
    expect(txEndSpy).toBeCalledTimes(1);
    expect(txAbortSpy).toBeCalledTimes(0);
  });
});
