import { useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { getArtworkUrl } from '../api';

export default function PokemonCard({ id, name, onPress, right }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: getArtworkUrl(id) }} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.number}>#{String(id).padStart(4, '0')}</Text>
        <Text style={styles.name}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
      </View>
      {right}
    </Pressable>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 12,
      marginVertical: 5,
      padding: 10,
      borderRadius: 14,
      borderLeftWidth: 5,
      borderLeftColor: colors.accent,
    },
    image: { width: 64, height: 64, backgroundColor: colors.background, borderRadius: 10 },
    info: { marginLeft: 14, flex: 1 },
    number: { color: colors.muted, fontSize: 12 },
    name: { color: colors.text, fontSize: 18, fontWeight: '600' },
  });