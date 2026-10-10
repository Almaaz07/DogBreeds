import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { imageCache } from './src/storage/imageCache';
import { store, useAppDispatch, useAppSelector } from './src/store';
import {
  initializeStore,
  setOffline,
  syncInitialData,
} from './src/store/slices/breedsSlice';

function MainApp() {
  const isDark = useColorScheme() === 'dark';
  const dispatch = useAppDispatch();
  const { isOffline, isHydrated, breedIds } = useAppSelector(state => state.breeds);
  const initialSyncAttempted = useRef(false);

  useEffect(() => {
    imageCache.init();
    dispatch(initializeStore());

    NetInfo.fetch().then(state => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      dispatch(setOffline(offline));
    });

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      dispatch(setOffline(offline));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    if (isHydrated && !initialSyncAttempted.current) {
      initialSyncAttempted.current = true;
      if (breedIds.length === 0 && !isOffline) {
        dispatch(syncInitialData(true));
      }
    }
  }, [dispatch, isHydrated, breedIds.length, isOffline]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NavigationContainer theme={isDark ? NavDarkTheme : NavDefaultTheme}>
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}
