import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="UserProfile"
        options={{ title: "Profile", headerShown: true }}
      />
    </Stack>
  );
}
