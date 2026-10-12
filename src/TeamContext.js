import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pokedex_team_02240174';
export const MAX_TEAM = 6;

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved team when the app starts
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setTeam(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load team', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save every time the team changes (after the first load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)).catch((e) =>
      console.warn('Could not save team', e)
    );
  }, [team, loaded]);

  const isInTeam = (id) => team.some((p) => p.id === id);
  const isFull = team.length >= MAX_TEAM;

  // member: { id, name, stats: [{ name, value }] }
  const addToTeam = (member) => {
    setTeam((prev) => {
      if (prev.length >= MAX_TEAM || prev.some((p) => p.id === member.id)) return prev;
      return [...prev, member];
    });
  };

  const removeFromTeam = (id) => {
    setTeam((prev) => prev.filter((p) => p.id !== id));
  };

  const totalStats = team.reduce(
    (sum, p) => sum + p.stats.reduce((s, st) => s + st.value, 0),
    0
  );

  return (
    <TeamContext.Provider
      value={{ team, loaded, isInTeam, isFull, addToTeam, removeFromTeam, totalStats }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);