import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';

interface ReferenceLinksProps {
    links: { label: string; url: string }[];
}

const ReferenceLinks = ({ links }: ReferenceLinksProps) => {

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            alert(`Cannot open this URL: ${url}`);
        }
    };

    const renderItem = ({ item, index }: { item: { label: string; url: string }; index: number }) => (
        <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => openLink(item.url)}
        >
            <Text style={styles.linkText}>{index + 1}. {item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.title}>Reference Links: </Text>
                <MaterialIcons name="add-link" size={25} color="grey" style={{ paddingTop: 14 }} />
            </View>

            <View>
                {links.map((link, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.linkContainer}
                        onPress={() => Linking.openURL(link.url)}
                    >
                        <Text style={styles.linkText}>{index + 1}. {link.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: 'column', gap: 10 }}>
                <Text style={styles.title}>Aim Progress </Text>
                <Text style={{ color: 'grey' }}>30% completed</Text>
                <Progress.Bar progress={0.3} width={300} animated={true} color='grey' />
            </View>
        </View>
    );
};

export default ReferenceLinks;

const styles = StyleSheet.create({
    container: {
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: '#333',
    },
    linkContainer: {
        paddingVertical: 7,
        marginHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    linkText: {
        fontSize: 16,
        color: '#007BFF', // Link color
    },
});
