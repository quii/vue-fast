import { InMemoryShootRepository } from '../InMemoryShootRepository.js';
import { ShootRepositoryContract } from './ShootRepositoryContract.js';
import {describe} from 'vitest'

describe('in-memory ShootRepository', () => {
  ShootRepositoryContract(
    'InMemoryShootRepository',
    async () => new InMemoryShootRepository(),
    async () => { /* No cleanup needed */ }
  );
});