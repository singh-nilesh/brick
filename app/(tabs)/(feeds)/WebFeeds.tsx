import React, { useCallback, useRef, useState } from "react";
import { TextInput, View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, SectionList, Alert, Button } from "react-native";
import WebView from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import WebViewContainer from "@/components/WebViewContainer";
import { useSQLiteContext } from "expo-sqlite";
import { deleteReferences, getBookmarks, getRefLinks, insertReferences } from "@/utils/taskService";
import { router, useFocusEffect } from "expo-router";
import { add } from "date-fns";


interface RefLinkProps {
    task_id: number,
    task_title: string,
    name: string,
    url: string
}

interface BookmarksProps {
    id: number,
    name: string,
    url: string
};

const WebFeeds = () => {
    const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
    const webViewRef = useRef<WebView>(null);
    const [refList, setRefList] = useState<RefLinkProps[]>([]);
    const [bookmarks, setBookmarks] = useState<BookmarksProps[]>([]);
    const [newBookmark, setNewBookmark] = useState('');
    const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const db = useSQLiteContext();

    // Fetch refs for the database
    const fetchRefs = async () => {
        const refs = await getRefLinks(db, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setRefList(refs);
    };

    // Fetch bookmarks from the database
    const fetchBookmarks = async () => {
        const result = await getBookmarks(db) as BookmarksProps[];
        setBookmarks(result);
    }

    // Hook to fetch refs from the database on page load
    useFocusEffect(
        useCallback(() => {
            fetchRefs();
            fetchBookmarks();
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
        setCurrentUrl(navState.url); // Update the state with the current page's URL
    };

    const handleDelBookmark = async (item: any) => {
        await deleteReferences(db, item);
        fetchBookmarks();
    }

    const handelAddBookmark = async (newUrl: { name: string, url: string }) => {
        await insertReferences(db, null, [newUrl]);
        fetchBookmarks();
    }

    // Inside renderSideDrawer function
    const renderSideDrawer = () => {
        type SectionData = BookmarksProps | RefLinkProps;

        const sections: { title: string; data: SectionData[] }[] = [
            { title: "Bookmarks", data: bookmarks },
            { title: "Task References", data: refList },
        ];

        return (
            <Modal
                visible={isDrawerOpen}
                animationType='none'
                transparent={true}
                onRequestClose={() => setIsDrawerOpen(false)}
            >
                <View style={styles.backdrop}>
                    <View style={styles.drawerContent}>
                        <Text style={{ paddingBottom: 30, fontSize: 25 }}>Menu</Text>

                        {/* Explore page */}
                        <TouchableOpacity
                            style={[styles.drawerItem, { padding: 10, flexDirection: "row" }]}
                            onPress={() => {
                                setIsDrawerOpen(false);
                                router.push("/ExplorePage")
                            }}
                        >
                            <Ionicons name="library-outline" size={24} color="black" style={{ paddingHorizontal: 10 }} />
                            <Text style={styles.drawerTitle}>Explore</Text>
                        </TouchableOpacity>

                        {/* SectionList for Bookmarks & Websites */}
                        <SectionList
                            scrollEnabled={true}
                            sections={sections}
                            keyExtractor={(item, index) => item.url + index}
                            renderSectionHeader={({ section: { title } }) => (
                                <Text style={styles.drawerTitle}>{title}</Text>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.drawerItem,
                                        currentUrl === item.url && { backgroundColor: "black" },
                                    ]}
                                    onPress={() => handleGo(item.url)}
                                >
                                    <Text
                                        style={[
                                            styles.drawerItemText,
                                            currentUrl === item.url && { color: "white" },
                                        ]}
                                        numberOfLines={1} // Ensures single-line text
                                        ellipsizeMode="tail"
                                    >
                                        {item.name}
                                    </Text>

                                    {/* Display task title if it exists, for References */}
                                    {"task_title" in item && (
                                        <Text
                                            numberOfLines={1} // Ensures single-line text
                                            ellipsizeMode="tail"
                                            style={{ fontSize: 12, color: "grey", paddingLeft: 20 }}>
                                            {item.task_title as string}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}

                            contentContainerStyle={{ paddingVertical: 10 }}

                            renderSectionFooter={({ section }) => {
                                if (section.title === 'Bookmarks' && section.data.length === 0) {
                                    return (
                                        <View style={{ alignItems: 'center', height: 100, justifyContent: 'center' }}>
                                            <Text>No Bookmarks added</Text>
                                        </View>
                                    );
                                }
                                else if (section.title === 'Task References' && section.data.length === 0) {
                                    return (
                                        <View style={{ alignItems: 'center', height: 100, justifyContent: 'center' }}>
                                            <Text>No reference available for a week</Text>
                                        </View>
                                    );
                                } else {
                                    return <View style={{ height: 40 }} />;
                                }
                            }}
                        />
                    </View>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsDrawerOpen(false)} />
                </View>
            </Modal>
        );
    };

    return (
        <View style={{ flex: 1 }}>

            {/* Top Navigation */}
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => setIsDrawerOpen(true)}
                >
                    <Ionicons name="menu" size={25} color="black" />
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => setShowAddBookmarkModal(true)}
                >
                    <Ionicons name="star" size={20} 
                    color = {
                        bookmarks.some((item) => item.url === currentUrl) ? 'black' : 'lightgrey'
                    } />
                </TouchableOpacity>

                <View style={styles.urlContainer}>
                    <TextInput
                        style={styles.urlContainer}
                        placeholder="Enter URL"
                        value={currentUrl}
                        onChangeText={setCurrentUrl}
                        onSubmitEditing={() => handleGo(currentUrl)}
                    />
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

            {/* Side Drawer */
                renderSideDrawer()}

            {/* Add Bookmark Modal */}
            {showAddBookmarkModal && (
                <Modal transparent={true} animationType="fade" visible={showAddBookmarkModal}>
                    <TouchableOpacity style={styles.linkModalBackdrop}
                        onPress={() => {
                            setShowAddBookmarkModal(false);
                        }}>
                        <View style={styles.linkModal}>
                            <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail"
                            >URL: {currentUrl}</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Name"
                                value={newBookmark}
                                onChangeText={setNewBookmark}
                            />

                            <TouchableOpacity style={{ backgroundColor: 'black', padding: 10, borderRadius: 5 }}
                                onPress={() => {
                                    handelAddBookmark({ name: newBookmark, url: currentUrl });
                                    setShowAddBookmarkModal(false);
                                    setNewBookmark('');
                                }}
                            >
                                <Text style={{ paddingHorizontal: 10, color: 'white', fontSize: 16 }}>Add Bookmark</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
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
        padding: 6,
    },
    urlContainer: {
        flex: 1,
        fontSize: 15,
        flexDirection: "row",
        backgroundColor: "#d1d5db",
        height: 35,
        paddingHorizontal: 5,
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

    linkModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkModal: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalInput: {
        width: '100%',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        fontSize: 16,
    },
    linkText: {
        fontSize: 16,
        width: '100%',
        padding: 10,
        marginBottom: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
});
