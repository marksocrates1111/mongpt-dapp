import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

// --- MONAD TESTNET CONFIGURATION ---
// Official details for the Monad Testnet.
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    public: { http: ['https://testnet-rpc.monad.xyz/'] },
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com/' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [monadTestnet], // This now uses the official Monad Testnet configuration.
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'MonGPT',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, // IMPORTANT: Get this from WalletConnect Cloud
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains}
        theme={darkTheme({
          accentColor: '#B452FF', // Monad Purple
          accentColorForeground: 'white',
          borderRadius: 'medium',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
      >
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
