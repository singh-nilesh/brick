import { Stack } from "expo-router";

export default function JournalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dailyEntry"
        options={{ title: "Daily Entry", headerShown: true }}
      />
    </Stack>
  );
}
