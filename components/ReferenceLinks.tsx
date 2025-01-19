import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ReferenceLinksProps {
    links: { id: number | null, name: string; url: string }[];
    isEditing: boolean;
    onRemove(id: number | null, name: string): void;
}


const ReferenceLinks = ({ links, isEditing, onRemove }: ReferenceLinksProps) => {

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            alert(`Cannot open this URL: ${url}`);
        }
    };

    // function to remove link from list
    const handelRemoveLink = (id:number | null, name:string) => {
        if(id) {
            
        }
    }

    return (
        <View style={styles.container}>
            {links.map((link, index) => (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        key={link.name}
                        style={styles.linkContainer}
                        onPress={() => Linking.openURL(link.url)}
                    >
                        <Text style={styles.linkText}>{index + 1}. {link.name}</Text>
                    </TouchableOpacity>
                    {isEditing && (
                        <MaterialIcons name="remove-circle-outline" size={25} color="red"
                            onPress={() => onRemove(link.id, link.name)} />
                    )}
                </View>
            ))}
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
        paddingVertical: 0,
        paddingBottom: 10,
        marginHorizontal: 15,
        width: '75%',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    linkText: {
        fontSize: 16,
        color: '#007BFF', // Link color
    },
});
