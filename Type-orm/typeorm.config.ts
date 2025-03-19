import AppDataSource from './ormconfig';
import { DataSource } from 'typeorm';

export default {
  ...AppDataSource.options,
  migrations: {
    directory: 'src/migrations'
  }
};