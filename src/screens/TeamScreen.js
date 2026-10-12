import { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import PokemonCard from '../components/PokemonCard';
import { useTeam, MAX_TEAM } from '../TeamContext';
import { useTheme } from '../ThemeContext';

export default function TeamScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    summary: {
      padding: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryText: { color: colors.text, fontWeight: '600' },
    remove: { alignSelf: 'flex-end', marginRight: 20, marginBottom: 4 },
    removeText: { color: colors.danger, fontWeight: '600' },
    empty: { textAlign: 'center', color: colors.muted, marginTop: 40, paddingHorizontal: 30 },
  });