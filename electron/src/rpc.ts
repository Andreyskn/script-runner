import { createRequest, type JsonRpcRequest } from 'typed-rpc';

import type { Service } from '../../server/src/service';
import { socket } from './sock';

type RpcCallResult<T = unknown> = Promise<{
	response: Response;
	result: T | null;
}>;

async function rpcCall(request: JsonRpcRequest): RpcCallResult;

async function rpcCall<T extends keyof Service>(
	method: T,
	...args: Parameters<Service[T]>
): RpcCallResult<Awaited<ReturnType<Service[T]>>>;

async function rpcCall(
	requestOrMethod: JsonRpcRequest | keyof Service,
	...args: any[]
) {
	let request: JsonRpcRequest;
	const value = Promise.withResolvers<{ response: Response; result: any }>();

	if (typeof requestOrMethod === 'string') {
		request = createRequest(requestOrMethod, args);
	} else {
		request = requestOrMethod;
	}

	socket.send({ type: 'rpc-request', payload: request });

	const removeListener = socket.addListener((msg) => {
		if (msg.type !== 'rpc-response' || msg.payload.id !== request.id) {
			return;
		}

		removeListener();

		if ('error' in msg.payload) {
			value.resolve({
				response: new Response(msg.payload.error.message, {
					status: 500,
				}),
				result: null,
			});
			// TODO: handle error
			return;
		}

		value.resolve({
			response: new Response(JSON.stringify(msg.payload), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			}),
			result: msg.payload.result,
		});
	});

	return value.promise;
}

export const rpc = {
	call: rpcCall,
};
