import { Stack } from "expo-router";

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="TaskScreen"
        options={{ title: "Tasks", headerShown: true }}
      />
    </Stack>
  );
}
