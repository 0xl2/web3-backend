import faker from 'faker';
import { Player } from '@/models';
import setupTestDB from '../../utils/setupTestDB';

setupTestDB();

describe('Player model', () => {
  describe('User toJSON()', () => {
    test('should not return _id when toJson called', () => {
      const newPlayer = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        _id: 'test',
      };
      expect(new Player(newPlayer).toJSON()).not.toHaveProperty('_id');
      expect(new Player(newPlayer).toJSON()).toHaveProperty('id');
    });
  });
});
