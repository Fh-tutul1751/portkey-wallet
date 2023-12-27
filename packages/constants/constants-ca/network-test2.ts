import { NetworkItem } from '@portkey-wallet/types/types-ca/network';
import { LINK_PATH_ENUM } from './link';

export const NetworkList: NetworkItem[] = [
  {
    name: 'aelf Mainnet',
    walletType: 'aelf',
    networkType: 'MAIN',
    apiUrl: '',
    graphqlUrl: '',
    connectUrl: '',
  },
  {
    name: 'aelf Testnet',
    walletType: 'aelf',
    networkType: 'TESTNET',
    isActive: true,
    apiUrl: 'http://192.168.67.51:5577',
    graphqlUrl: 'http://192.168.67.51:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    connectUrl: 'http://192.168.67.51:8080',
  },
];

export const DefaultChainId = 'AELF';

export const OfficialWebsite = 'https://portkey.finance';

export const ThirdParty = `https://openlogin-test.portkey.finance`;
export const OpenLogin = `https://openlogin-test.portkey.finance`;

const EBridgeList = NetworkList.map(i => i.eBridgeUrl).filter(i => !!i) as string[];
const ETransferList = NetworkList.map(i => i.eTransferUrl).filter(i => !!i) as string[];
export const DAPP_WHITELIST: string[] = [...EBridgeList, ...ETransferList];

export const LinkPortkeyWebsite = 'https://portkey-website-dev.vercel.app';
export const LinkPortkeyPath = {
  addContact: LinkPortkeyWebsite + LINK_PATH_ENUM.addContact,
  addGroup: LinkPortkeyWebsite + LINK_PATH_ENUM.addGroup,
};
