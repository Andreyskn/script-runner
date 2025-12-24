export type RawScriptOutput =
	| {
			type: 'stdout';
			line: string;
	  }
	| {
			type: 'stderr';
			line: string;
	  }
	| {
			type: 'exit';
			code: number | string;
	  };

export type ScriptOutputMetadata = {
	order: number;
	timestamp: string;
};

export type ScriptOutput = RawScriptOutput & ScriptOutputMetadata;

export type WsMsg<
	T extends string,
	P extends Record<string, any> | null = null,
> = P extends null
	? { type: T; payload?: null }
	: {
			type: T;
			payload: P;
		};
