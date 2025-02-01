import React, { useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator } from "react-native";
import WebView from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import WebViewContainer from "@/components/WebViewContainer";
import { useSQLiteContext } from "expo-sqlite";
import { getRefLinks } from "@/utils/taskService";
import { useFocusEffect } from "expo-router";

interface RefLinkProps {
    task_id: number,
    task_title: string,
    ref_name: string,
    ref_url: string
}

const WebFeeds = () => {
    const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
    const webViewRef = useRef<WebView>(null);

    const [refList, setRefList] = useState<RefLinkProps[]>([]);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const db = useSQLiteContext();

    // Fetch refs for the database
    const fetchRefs = async () => {
        const refs = await getRefLinks(db, new Date(), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
        setRefList(refs);
    };

    // Hook to fetch refs from the database on page load
    useFocusEffect(
        useCallback(() => {
            fetchRefs();
        }, [db])
    );


    const handleGo = (url: string) => {
        if (url.startsWith("http")) {
            setCurrentUrl(url);
        } else {
            setCurrentUrl("https://" + url);
        }
    };

    const handleReload = () => {
        if (webViewRef.current && currentUrl) {
            webViewRef.current.reload();
        }
    };

    const handleNavigationStateChange = (navState: any) => {
        setCanGoBack(navState.canGoBack);
        setCanGoForward(navState.canGoForward);
    };

    const titles = [
        { id: "1", title: "Google", url: "https://www.google.com" },
        { id: "2", title: "LinkedIn", url: "https://www.linkedin.com" },
        { id: "3", title: "Glassdoor", url: "https://www.glassdoor.com" },
        { id: "4", title: "Internshala", url: "https://internshala.com" },
    ];

    return (
        <View style={{ flex: 1 }}>
            {/* Top Navigation */}
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => setIsDrawerOpen(true)}
                >
                    <Ionicons name="menu" size={24} color="black" />
                </TouchableOpacity>

                <View style={styles.urlContainer}>
                    <Text>{currentUrl}</Text>
                </View>

                <TouchableOpacity
                    disabled={!canGoBack}
                    style={styles.iconContainer}
                    onPress={() => webViewRef.current?.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={20}
                        color={canGoBack ? "black" : "grey"}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canGoForward}
                    style={styles.iconContainer}
                    onPress={() => webViewRef.current?.goForward()}
                >
                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={canGoForward ? "black" : "grey"}
                    />
                </TouchableOpacity>
            </View>

            {/* WebView */}
            <WebViewContainer
                ref={webViewRef}
                source={{ uri: currentUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={{ marginTop: 10, color: '#555' }}>Loading...</Text>
                    </View>
                )}
            />

            {/* Side Drawer */}
            <Modal
                visible={isDrawerOpen}
                animationType='none'
                transparent={true}
                onRequestClose={() => setIsDrawerOpen(false)}
            >
                <View style={styles.backdrop}>
                    <View style={styles.drawerContent}>
                        <Text style={styles.drawerTitle}>Select a Website</Text>
                        <FlatList
                            data={refList}
                            keyExtractor={(item) => item.task_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.drawerItem,
                                    currentUrl === item.ref_url && { backgroundColor: "black" },
                                    ]}
                                    onPress={() => {
                                        handleGo(item.ref_url);
                                    }}
                                >
                                    <Text style={[styles.drawerItemText, currentUrl === item.ref_url && { color: "white" }]}>
                                        {item.ref_name}
                                    </Text>
                                    <Text style={{fontSize:12, color:"grey", paddingLeft:20}}>{item.task_title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setIsDrawerOpen(false)}
                    />
                </View>
            </Modal>
        </View>
    );
};

export default WebFeeds;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 3,
        gap: 8,
        backgroundColor: "#e5e7eb",
    },
    iconContainer: {
        padding: 8,
    },
    urlContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#d1d5db",
        padding: 8,
        borderRadius: 8,
    },

    backdrop: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-start",
    },
    drawerContent: {
        width: "70%",
        maxWidth: 400,
        backgroundColor: "white",
        padding: 16,
    },
    drawerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    drawerItem: {
        padding: 5,
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    drawerItemText: {
        fontSize: 16,
        paddingLeft: 10,
    },
});
