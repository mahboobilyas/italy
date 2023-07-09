import { useWeb3Modal } from '@web3modal/react';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Address, formatEther, parseEther } from 'viem';
import { useWalletClient, usePublicClient, useAccount, useConnect, useDisconnect } from 'wagmi';

const App = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  const [consoleMsg, setConsoleMsg] = useState<null | string>(null);
  const [consoleLoading, setConsoleLoading] = useState<boolean>(false);
  const appendConsoleLine = (message: string) => {
    return setConsoleMsg(prevState => {
      return `${prevState}\n\n${message}`;
    });
  }

  const resetConsole = () => {
    setConsoleMsg(null);
    setConsoleLoading(true);
  }

  const addNewConsoleLine = (message: string) => {
    setConsoleMsg(() => {
      return message;
    });
  }

  const consoleWelcomeMessage = () => {
    setConsoleLoading(false);
    setConsoleMsg('Status: Wallet not connected. Please connect wallet to use Methods');
  }

  const consoleErrorMessage = () => {
    setConsoleLoading(false);
    setConsoleMsg('An error occurred');
  }

  useEffect(() => {
    if (isConnected) {
      setConsoleMsg('Wallet connected!');
    } else {
      consoleWelcomeMessage();
    }
  }, [isConnected])

  const getChainID = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      resetConsole();
      const chainId = await walletClient.getChainId();
      console.log('walletClient.getChainId()', chainId);
      addNewConsoleLine(`walletClient.getChainId(): ${chainId}`);
      setConsoleLoading(false);
    } catch (e) {
      console.error(e);
      consoleErrorMessage();
    }
  }

  const getBalance = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }
      resetConsole();
      const [account] = await walletClient.getAddresses();
      const balance = await publicClient.getBalance({
        address: account,
      });
      const formattedBalance = formatEther(balance);
      console.log('balance', formattedBalance);
      addNewConsoleLine(`balance: ${formattedBalance}`);

      setConsoleLoading(false);
    } catch (e) {
      console.error(e);
      consoleErrorMessage();
    }
  }


  const getNetwork = async () => {
    try {
      resetConsole();
      const network = publicClient.chain;
      console.log('network:', network);

      addNewConsoleLine(`network: ${JSON.stringify(network)}`);
      setConsoleLoading(false);
    } catch (e) {
      console.error(e);
      consoleErrorMessage();
    }
  }

  const signMessage = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }
      resetConsole();
      const message = `Message`;


      const [account] = await walletClient.getAddresses();

      // sign
      const sig = await walletClient.signMessage({
        message,
        account
      });
      console.log('signature:', sig);

      addNewConsoleLine(`signature: ${sig}`);

      const isValid = await publicClient.verifyMessage({
        address: account,
        message,
        signature: sig
      });

      console.log('isValid?', isValid);

      appendConsoleLine(`isValid? ${isValid}`);
      setConsoleLoading(false);
    } catch (e) {
      console.error(e);
      consoleErrorMessage();
    }
  }

  const sendETH = async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }
      resetConsole();

      console.log(`Transfer txn on ${walletClient.getChainId()}`);
      addNewConsoleLine(`Transfer txn on ${walletClient.getChainId()}`);

      const toAddress = ethers.Wallet.createRandom().address;

      const balance1 = await publicClient.getBalance({
        address: toAddress as Address
      });
      console.log(`balance of ${toAddress}, before:`, balance1);
      addNewConsoleLine(`balance of ${toAddress}, before: ${balance1}`);

      const [account] = await walletClient.getAddresses();

      /* @ts-ignore-next-line */
      await walletClient.sendTransaction({
        to: toAddress as Address,
        value: parseEther('1.00'),
        account,
      });

      const balance2 = await publicClient.getBalance({
        address: toAddress as Address
      });
      console.log(`balance of ${toAddress}, after:`, balance2);
      addNewConsoleLine(`balance of ${toAddress}, after: ${balance2}`);
      setConsoleLoading(false);
    } catch (e) {
      console.error(e);
      consoleErrorMessage();
    }
  }

  const disableActions = !isConnected;

  const getWalletActions = () => {
    if (!isConnected) {
      return null;
    }
    return (
      <>

        <div><button className="btn btn-primary" disabled={disableActions} onClick={() => getChainID()}>ChainID</button></div>
        <div></div>
        <div><button className="btn btn-primary" disabled={disableActions} onClick={() => getNetwork()}>Network</button></div>
        <div></div>
        <div><button className="btn btn-primary" disabled={disableActions} onClick={() => getBalance()}>Get Balance</button></div>
        <div></div>
        <div>
          <button className="btn btn-primary" disabled={disableActions} onClick={() => signMessage()}>
            Sign Message
          </button>
        </div>
        <div></div>
        <div>
          <button className="btn btn-primary" disabled={disableActions} onClick={() => sendETH()}>
            Send ETH
          </button>
        </div>
        <div></div>
      </>
    );
  }

  const getConnectionButtons = () => {
    if (!isConnected) {
      return (
        <div>
          <button className="btn btn-primary" disabled={isLoading} onClick={() => open()}>
            Connect
          </button>
        </div>
      );
    }

    return (
      <div>
        <button className="btn btn-danger" onClick={() => disconnect()}>Disconnect Wallet</button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Uxos Boost</h1>
      {getConnectionButtons()}
      {getWalletActions()}
      <div className="mt-4">{consoleMsg}</div>
    </div>
  );
}

export default React.memo(App);