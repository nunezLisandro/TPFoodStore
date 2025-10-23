interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	// add other VITE_ variables here as needed
	readonly [key: string]: string | undefined;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
