export interface NetworkConfig {
    chainId: string;
    chainName: string;
    name: string;
    icon: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
    layerzero: {
        endpoint: string;
        chainId: number;
    },
    erc20Token: string;
    prefix: string;
}