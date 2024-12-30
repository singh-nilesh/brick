import { Stack } from "expo-router";

export default function FeedsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="WebFeeds"
                options={{ title: "Feeds", headerShown: true }}
            />

            <Stack.Screen
                name="index"
                options={{ title: "Feeds", headerShown: true }}
            />
        </Stack>
    );
}
