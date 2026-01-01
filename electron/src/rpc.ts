import { rpcClient } from 'typed-rpc';

import type { Service } from '../../server/src/service';

export const rpc = rpcClient<Service>('http://localhost:3001/api/');
