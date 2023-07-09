import Demo from './Demo'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, mainnet, WagmiConfig } from 'wagmi'

const chains = [mainnet]
const projectId = '71c414614f01fe0a63817f0197394614'
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 2, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export const App = () => {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Demo />
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
