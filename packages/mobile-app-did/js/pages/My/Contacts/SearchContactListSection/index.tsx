import React, { useCallback } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { defaultColors } from 'assets/theme';
import GStyles from 'assets/theme/GStyles';
import ContactItem from 'components/ContactItem';

type SearchContactListSectionType = {
  list: any[];
};

const SearchContactListSection: React.FC<SearchContactListSectionType> = (props: SearchContactListSectionType) => {
  const { list } = props;

  const renderItem = useCallback(({ item }: any) => {
    return <ContactItem contact={item} />;
  }, []);

  return <FlatList data={list} renderItem={renderItem} />;
};

export default SearchContactListSection;

export const pageStyles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg1,
    ...GStyles.paddingArg(0),
  },
});
