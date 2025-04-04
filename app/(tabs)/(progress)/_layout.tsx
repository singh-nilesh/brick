import { Stack } from "expo-router";

export default function ProgressLayout() {
  return (
    <Stack >
      <Stack.Screen
        name="Progress"
        options={{ title: "Progress", headerShown: false }}
      />

      <Stack.Screen
        name="HabitSummary"
        options={{ title: "HabitSummary" }}
      />

    </Stack>
  );
}
