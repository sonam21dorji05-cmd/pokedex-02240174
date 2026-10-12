import { useEffect, useState, useCallback } from 'react';
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
import { COLORS } from '../config';

const MAX_STAT = 255;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetails(id);
      setPokemon(data);
      navigation.setOptions({ title: capitalize(data.name) });
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
        <ActivityIndicator size="large" color={COLORS.primary} />
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

      {/* Placeholder: wired to the team in Step 6 */}
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Add to team</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { alignItems: 'center', padding: 20 },
  center: { alignItems: 'center', justifyContent: 'center' },
  artwork: { width: 220, height: 220 },
  number: { color: COLORS.muted, marginTop: 8 },
  name: { color: COLORS.text, fontSize: 28, fontWeight: '700', marginBottom: 10 },
  types: { flexDirection: 'row', marginBottom: 10 },
  typeChip: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  typeText: { color: '#fff', fontWeight: '600' },
  measure: { color: COLORS.muted, marginBottom: 18 },
  stats: { width: '100%', marginBottom: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  statName: { width: 120, color: COLORS.text, fontSize: 13 },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#E2D9EE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: 10, backgroundColor: COLORS.accent, borderRadius: 5 },
  statValue: { width: 36, textAlign: 'right', color: COLORS.text, fontWeight: '600' },
  errorText: { color: COLORS.text, fontSize: 16, marginBottom: 6 },
  errorDetail: { color: COLORS.muted, marginBottom: 14 },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});