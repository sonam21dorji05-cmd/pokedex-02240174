import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { fetchPokemonPage, getArtworkUrl } from '../api';
import { useTheme } from '../ThemeContext';

const FIRST_GEN = 151;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function GameScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [pool, setPool] = useState(null); // first 151 Pokémon
  const [round, setRound] = useState(null); // { answer, options }
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const newRound = useCallback((list) => {
    const shuffled = shuffle(list);
    const answer = shuffled[0];
    const options = shuffle(shuffled.slice(0, 4));
    setRound({ answer, options });
    setSelected(null);
  }, []);

  const loadPool = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPokemonPage(0, FIRST_GEN);
      setPool(list);
      newRound(list);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [newRound]);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  const answered = selected !== null;

  const choose = (option) => {
    if (answered) return;
    setSelected(option.id);
    if (option.id === round.answer.id) {
      const newStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
    } else {
      setStreak(0);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !round) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Could not start the game.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Pressable style={styles.button} onPress={loadPool}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const optionStyle = (option) => {
    if (!answered) return styles.option;
    if (option.id === round.answer.id) return [styles.option, styles.optionCorrect];
    if (option.id === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.scoreLine}>
        Score {score} · Streak {streak} · Best {best}
      </Text>
      <Text style={styles.title}>
        {answered ? capitalize(round.answer.name) + '!' : "Who's that Pokémon?"}
      </Text>

      {/* Light panel so the black silhouette is visible in dark mode */}
      <View style={styles.imageBox}>
        {answered ? (
          <Image
            key="revealed"
            source={{ uri: getArtworkUrl(round.answer.id) }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Image
            key="silhouette"
            source={{ uri: getArtworkUrl(round.answer.id) }}
            style={[styles.image, { tintColor: '#000' }]}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.options}>
        {round.options.map((option) => (
          <Pressable
            key={option.id}
            style={optionStyle(option)}
            onPress={() => choose(option)}
            disabled={answered}
          >
            <Text style={styles.optionText}>{capitalize(option.name)}</Text>
          </Pressable>
        ))}
      </View>

      {answered && (
        <Pressable style={styles.button} onPress={() => newRound(pool)}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: 20 },
    center: { justifyContent: 'center' },
    scoreLine: { color: colors.muted, marginTop: 4 },
    title: { color: colors.text, fontSize: 22, fontWeight: '700', marginVertical: 10 },
    imageBox: {
      backgroundColor: '#F4F0F9',
      borderRadius: 20,
      padding: 8,
      marginBottom: 14,
    },
    image: { width: 220, height: 220 },
    options: { width: '100%', marginBottom: 14 },
    option: {
      backgroundColor: colors.card,
      paddingVertical: 13,
      borderRadius: 12,
      marginVertical: 5,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionCorrect: { backgroundColor: colors.correct, borderColor: colors.correct },
    optionWrong: { backgroundColor: colors.wrong, borderColor: colors.wrong },
    optionDim: { opacity: 0.5 },
    optionText: { color: colors.text, fontSize: 16, fontWeight: '600' },
    errorText: { color: colors.text, fontSize: 16, marginBottom: 6 },
    errorDetail: { color: colors.muted, marginBottom: 14 },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignSelf: 'stretch',
      alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  });