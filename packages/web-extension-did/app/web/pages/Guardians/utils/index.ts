import { LoginType } from '@portkey-wallet/types/types-ca/wallet';
import { IconType } from 'types/icon';
import { UserGuardianItem } from '@portkey-wallet/store/store-ca/guardians/type';
import { VerifierItem } from '@portkey-wallet/types/verifier';

export const guardianIconMap: Record<LoginType, IconType> = {
  [LoginType.Email]: 'email',
  [LoginType.Phone]: 'GuardianPhone',
  [LoginType.Apple]: 'GuardianApple',
  [LoginType.Google]: 'GuardianGoogle',
};

export interface IGuardianTypeAccount {
  guardianAccount: string;
  guardianType: LoginType;
}

export const guardianAccountIsExist = (
  currentGuardian: IGuardianTypeAccount,
  userGuardiansList: UserGuardianItem[] = [],
) => {
  return userGuardiansList.some(
    (guardian) =>
      guardian.guardianAccount === currentGuardian.guardianAccount &&
      guardian.guardianType === currentGuardian.guardianType,
  );
};

export interface VerifierStatusItem extends VerifierItem {
  isUsed?: boolean;
}

export const getVerifierStatusMap = (
  verifierMap: { [x: string]: VerifierItem } = {},
  userGuardiansList: UserGuardianItem[] = [],
) => {
  const verifierStatusMap: { [x: string]: VerifierStatusItem } = {};
  Object.values(verifierMap).forEach((verifier) => {
    const isUsed = userGuardiansList.some((guardian) => guardian.verifier?.id === verifier.id);
    verifierStatusMap[verifier.id] = {
      ...verifier,
      isUsed,
    };
  });
  return verifierStatusMap;
};
