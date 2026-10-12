import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import PokemonCard from '../components/PokemonCard';
import { fetchPokemonPage, fetchAllPokemon } from '../api';
import { COLORS, START_OFFSET } from '../config';

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 400;

export default function PokedexScreen({ navigation }) {
  // Infinite scroll state
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(START_OFFSET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Search state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [allPokemon, setAllPokemon] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const allLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || debouncedQuery) return;
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
  }, [loading, hasMore, offset, debouncedQuery]);

  useEffect(() => {
    loadMore();
  }, []);

  // Debounce: update debouncedQuery only after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Load the full name list the first time a search is made
  useEffect(() => {
    if (!debouncedQuery || allPokemon || allLoadingRef.current) return;
    allLoadingRef.current = true;
    setSearching(true);
    setSearchError(null);
    fetchAllPokemon()
      .then(setAllPokemon)
      .catch((e) => setSearchError(e.message || 'Search failed'))
      .finally(() => {
        allLoadingRef.current = false;
        setSearching(false);
      });
  }, [debouncedQuery, allPokemon]);

  const results =
    debouncedQuery && allPokemon
      ? allPokemon.filter((p) => p.name.includes(debouncedQuery))
      : [];

  const isSearching = debouncedQuery.length > 0;
  const data = isSearching ? results : items;

  const renderFooter = () => {
    if (isSearching) return null;
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

  const renderEmpty = () => {
    if (isSearching) {
      if (searching || (!allPokemon && !searchError)) {
        return <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />;
      }
      if (searchError) {
        return (
          <View style={styles.center}>
            <Text style={styles.errorText}>{searchError}</Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                setSearchError(null);
                setDebouncedQuery((q) => q + ' ');
                setDebouncedQuery(query.trim().toLowerCase());
              }}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        );
      }
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>No Pokémon found for "{debouncedQuery}"</Text>
        </View>
      );
    }
    return loading ? <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} /> : null;
  };

  // Full-screen error when the very first load fails
  if (!isSearching && error && items.length === 0 && !loading) {
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
      <TextInput
        style={styles.search}
        placeholder="Search all Pokémon"
        placeholderTextColor={COLORS.muted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={data}
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
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  search: {
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.muted,
  },
  errorText: { color: COLORS.text, fontSize: 16, marginBottom: 6, textAlign: 'center' },
  errorDetail: { color: COLORS.muted, marginBottom: 14 },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});