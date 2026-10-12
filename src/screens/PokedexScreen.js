import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonPage } from '../api';
import { COLORS, START_OFFSET } from '../config';

const PAGE_SIZE = 20;

export default function PokedexScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(START_OFFSET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPokemonPage(offset, PAGE_SIZE);
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.filter((p) => !seen.has(p.id))];
      });
      setOffset((o) => o + PAGE_SIZE);
      if (page.length < PAGE_SIZE) setHasMore(false);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset]);

  useEffect(() => {
    loadMore();
  }, []);

  const renderFooter = () => {
    if (loading) return <ActivityIndicator style={{ margin: 20 }} color={COLORS.primary} />;
    if (error && items.length > 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.button} onPress={loadMore}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return null;
  };

  // Full-screen error when the very first load fails
  if (error && items.length === 0 && !loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Could not load Pokémon.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Pressable style={styles.button} onPress={loadMore}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PokemonCard
            id={item.id}
            name={item.name}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { color: COLORS.text, fontSize: 16, marginBottom: 6 },
  errorDetail: { color: COLORS.muted, marginBottom: 14 },
  button: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
});