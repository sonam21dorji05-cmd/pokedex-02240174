import { View, Text } from 'react-native';

export default function DetailScreen({ route }) {
  const { id } = route.params;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Detail screen for id {id}</Text>
    </View>
  );
}