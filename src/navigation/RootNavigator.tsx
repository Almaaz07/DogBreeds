import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BreedDetailScreen } from '../screens/BreedDetailScreen';
import { BreedListScreen } from '../screens/BreedListScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BreedList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="BreedList" component={BreedListScreen} />
      <Stack.Screen name="BreedDetail" component={BreedDetailScreen} />
    </Stack.Navigator>
  );
};
