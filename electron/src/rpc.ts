import { rpcClient } from 'typed-rpc';

import type { Service } from '../../server/src/service';

export const rpc = rpcClient<Service>(
	`http://${process.env.IP}:${process.env.PORT}/api/`
);
