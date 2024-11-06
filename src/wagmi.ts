import { createConfig, cookieStorage, createStorage, http } from 'wagmi'
import { authConnector } from '@web3modal/wagmi'
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { walletConnect } from 'wagmi/connectors'
import { metaMask } from 'wagmi/connectors'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const metadata = { 
  name: 'ArtGridz', 
  description: 'Collaborative pixel art on the blockchain.', 
  url: 'https://artgridz.decentraplace.io', 
}

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'ArtGridz',
      preference: 'all'
    }),
  
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  })
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
