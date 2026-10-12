import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import PokedexScreen from './src/screens/PokedexScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import DetailScreen from './src/screens/DetailScreen';
import { APP_NAME, COLORS } from './src/config';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#fff',
};

const tabIcon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerStyle,
        tabBarActiveTintColor: COLORS.primary,
      }}
    >
      <Tab.Screen
        name="Pokédex"
        component={PokedexScreen}
        options={{
          title: APP_NAME,
          tabBarLabel: 'Pokédex',
          tabBarIcon: tabIcon('📖'),
        }}
      />
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
        options={{
          title: `${APP_NAME} · Team`,
          tabBarLabel: 'My Team',
          tabBarIcon: tabIcon('👥'),
        }}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          title: `${APP_NAME} · Game`,
          tabBarLabel: 'Game',
          tabBarIcon: tabIcon('🎮'),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={headerStyle}>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}