import { Text, Pressable } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import PokedexScreen from './src/screens/PokedexScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import DetailScreen from './src/screens/DetailScreen';
import { TeamProvider } from './src/TeamContext';
import { ThemeProvider, useTheme } from './src/ThemeContext';
import { APP_NAME } from './src/config';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Pressable onPress={toggleTheme} style={{ marginLeft: 16 }} hitSlop={10}>
      <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
    </Pressable>
  );
}

function Tabs() {
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerLeft: () => <ThemeToggle />,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: isDark ? colors.accent : colors.primary,
        tabBarInactiveTintColor: colors.muted,
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

function Root() {
  const { colors } = useTheme();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'Details', headerBackTitle: 'Back' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TeamProvider>
        <Root />
      </TeamProvider>
    </ThemeProvider>
  );
}