import { ChainId } from '..';

export enum SeedTypeEnum {
  'None' = 0,
  'FT' = 1,
  'NFT' = 2,
}

export enum SeedTypeShowEnum {
  '' = 0,
  'Token' = 1,
  'NFT' = 2,
}

// nft collection types
export type NFTCollectionItemBaseType = {
  chainId: ChainId;
  collectionName: string;
  imageUrl: string;
  itemCount: number;
  symbol: string;
  inscriptionName?: string;
  limitPerMint?: number;
  isSeed?: boolean;
  seedType?: SeedTypeEnum;
  expires?: string;
  seedOwnedSymbol?: string;
};

export interface NFTCollectionItemShowType extends NFTCollectionItemBaseType {
  isFetching: boolean;
  skipCount: number;
  maxResultCount: number;
  totalRecordCount: string | number;
  children: NFTItemBaseType[];
}

// nft item types
export type NFTItemBaseType = {
  chainId: ChainId;
  symbol: string;
  tokenId: string;
  alias: string;
  quantity: string;
  imageUrl: string;
  tokenContractAddress: string;
  totalSupply: string | number;
  decimals?: string;
  isSeed?: boolean;
  seedType?: SeedTypeEnum;
  inscriptionName?: string;
  limitPerMint?: number;
  expires?: string;
  seedOwnedSymbol?: string;
};

export type RateBaseType = {
  symbol: string;
  priceInUsd: string | number;
};
