import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import PokemonCard from '../components/PokemonCard';
import { useTeam, MAX_TEAM } from '../TeamContext';
import { COLORS } from '../config';

export default function TeamScreen({ navigation }) {
  const { team, totalStats, removeFromTeam } = useTeam();

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {team.length}/{MAX_TEAM} Pokémon · Combined base stats: {totalStats}
        </Text>
      </View>
      <FlatList
        data={team}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View>
            <PokemonCard
              id={item.id}
              name={item.name}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            />
            <Pressable style={styles.remove} onPress={() => removeFromTeam(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Your team is empty. Open a Pokémon and tap "Add to team".
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summary: {
    padding: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D9EE',
  },
  summaryText: { color: COLORS.text, fontWeight: '600' },
  remove: { alignSelf: 'flex-end', marginRight: 20, marginBottom: 4 },
  removeText: { color: '#C0392B', fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40, paddingHorizontal: 30 },
});