import config from 'config';

import { DbConfig } from '@interfaces/db-config';

const { connectionString }: DbConfig = config.get('dbConfig');

export const dbConnection = {
  url: connectionString,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
