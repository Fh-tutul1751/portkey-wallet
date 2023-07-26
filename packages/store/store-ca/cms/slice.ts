import { createSlice } from '@reduxjs/toolkit';
import {
  getDiscoverGroupAsync,
  getSocialMediaAsync,
  getTabMenuAsync,
  getBuyButtonAsync,
  getRememberMeBlackListAsync,
} from './actions';
import { CMSState } from './types';

const initialState: CMSState = {
  socialMediaListNetMap: {},
  tabMenuListNetMap: {},
  discoverGroupListNetMap: {},
  buyButtonNetMap: {},
  rememberMeBlackListMap: {},
};
export const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getSocialMediaAsync.fulfilled, (state, action) => {
        state.socialMediaListNetMap = {
          ...state.socialMediaListNetMap,
          ...action.payload.socialMediaListNetMap,
        };
      })
      .addCase(getSocialMediaAsync.rejected, (_state, action) => {
        console.log('getSocialMediaAsync error', action);
      })
      .addCase(getTabMenuAsync.fulfilled, (state, action) => {
        state.tabMenuListNetMap = {
          ...state.tabMenuListNetMap,
          ...action.payload.tabMenuListNetMap,
        };
      })
      .addCase(getTabMenuAsync.rejected, (_state, action) => {
        console.log('getTabMenuAsync error', action);
      })
      .addCase(getDiscoverGroupAsync.fulfilled, (state, action) => {
        state.discoverGroupListNetMap = {
          ...state.discoverGroupListNetMap,
          ...action.payload.discoverGroupListNetMap,
        };
      })
      .addCase(getDiscoverGroupAsync.rejected, (_state, action) => {
        console.log('getDiscoverGroupAsync error', action);
      })
      .addCase(getBuyButtonAsync.fulfilled, (state, action) => {
        state.buyButtonNetMap = {
          ...state.buyButtonNetMap,
          ...action.payload.buyButtonNetMap,
        };
      })
      .addCase(getBuyButtonAsync.rejected, (_state, action) => {
        console.log('getBuyButtonAsync error', action);
      })
      .addCase(getRememberMeBlackListAsync.fulfilled, (state, action) => {
        state.rememberMeBlackListMap = {
          ...state.rememberMeBlackListMap,
          ...action.payload.rememberMeBlackListMap,
        };
      })
      .addCase(getRememberMeBlackListAsync.rejected, (_state, action) => {
        console.log('getRememberMeBlackListAsync error', action);
      });
  },
});
