import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { fetchPokemonDetails, getArtworkUrl } from '../api';
import { useTeam } from '../TeamContext';
import { useTheme } from '../ThemeContext';
import { APP_NAME } from '../config';

const MAX_STAT = 255;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInTeam, isFull, addToTeam, removeFromTeam } = useTeam();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetails(id);
      setPokemon(data);
      navigation.setOptions({ title: APP_NAME });
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Could not load details.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Pressable style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const inTeam = isInTeam(pokemon.id);
  const disabled = !inTeam && isFull;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={{ uri: getArtworkUrl(pokemon.id) }}
        style={styles.artwork}
        resizeMode="contain"
      />
      <Text style={styles.number}>#{String(pokemon.id).padStart(4, '0')}</Text>
      <Text style={styles.name}>{capitalize(pokemon.name)}</Text>

      <View style={styles.types}>
        {pokemon.types.map((t) => (
          <View key={t.type.name} style={styles.typeChip}>
            <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.measure}>
        Height: {(pokemon.height / 10).toFixed(1)} m · Weight: {(pokemon.weight / 10).toFixed(1)} kg
      </Text>

      <View style={styles.stats}>
        {pokemon.stats.map((s) => (
          <View key={s.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{capitalize(s.stat.name)}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min((s.base_stat / MAX_STAT) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.statValue}>{s.base_stat}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.button, disabled && styles.buttonDisabled]}
        disabled={disabled}
        onPress={() => {
          if (inTeam) {
            removeFromTeam(pokemon.id);
          } else {
            addToTeam({
              id: pokemon.id,
              name: pokemon.name,
              stats: pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
            });
          }
        }}
      >
        <Text style={styles.buttonText}>
          {inTeam ? 'Remove from team' : disabled ? 'Team is full (6/6)' : 'Add to team'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { alignItems: 'center', padding: 20 },
    center: { alignItems: 'center', justifyContent: 'center' },
    artwork: { width: 220, height: 220 },
    number: { color: colors.muted, marginTop: 8 },
    name: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 10 },
    types: { flexDirection: 'row', marginBottom: 10 },
    typeChip: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 14,
      marginHorizontal: 4,
    },
    typeText: { color: '#fff', fontWeight: '600' },
    measure: { color: colors.muted, marginBottom: 18 },
    stats: { width: '100%', marginBottom: 20 },
    statRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    statName: { width: 120, color: colors.text, fontSize: 13 },
    barTrack: {
      flex: 1,
      height: 10,
      backgroundColor: colors.track,
      borderRadius: 5,
      overflow: 'hidden',
    },
    barFill: { height: 10, backgroundColor: colors.accent, borderRadius: 5 },
    statValue: { width: 36, textAlign: 'right', color: colors.text, fontWeight: '600' },
    errorText: { color: colors.text, fontSize: 16, marginBottom: 6 },
    errorDetail: { color: colors.muted, marginBottom: 14 },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 10,
      alignSelf: 'stretch',
      alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: colors.muted },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  });