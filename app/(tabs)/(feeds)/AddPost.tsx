import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { fs_storage, Firestore_db } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const AddPost = () => {
    const { user } = useUser();
    const [context, setContext] = useState('');
    const [roadmap, setRoadmap] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    {/*
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "You need to grant camera roll permissions to upload an image.");
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
    
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!image) {
            Alert.alert('No image to upload');
            return null;
        }
        
        const filename = `contextImages/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(fs_storage, filename);
        const response = await fetch(image);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                null,
                (error) => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };
    */}

    const handlePost = async () => {
        if (!context.trim()) {
            Alert.alert('Error', 'Context cannot be empty');
            return;
        }

        setUploading(true);
        //const imageUrl = image ? await uploadImage() : null;

        try {
            await addDoc(collection(Firestore_db, 'posts'), {
                userId: user?.id || 'guest',
                context,
                contextImg: '',//imageUrl || '',
                likes: [],
                roadmap,
                postTime: serverTimestamp(),
            });
            Alert.alert('Success', 'Post published successfully');
            setContext('');
            setRoadmap('');
            setImage(null);
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while posting');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>

            <TouchableOpacity onPress={() => router.back()}>
                <AntDesign name="leftcircleo" size={30} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Create a Post</Text>
            <TextInput
                style={styles.input}
                value={context}
                onChangeText={setContext}
                placeholder="What's on your mind?"
            />
            <TextInput
                style={styles.input}
                value={roadmap}
                onChangeText={setRoadmap}
                placeholder="Enter roadmap (optional)"
            />
            <TouchableOpacity onPress={() => Alert.alert('Alert', 'Image picker pressed')} style={styles.imagePicker}>
                <MaterialIcons name="add-a-photo" size={24} color="black" />
                <Text>Pick an Image</Text>
            </TouchableOpacity>

            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
            <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={uploading}>
                <Feather name="send" size={24} color="white" />
                <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Post'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: '#CCC',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 10,
    },
    imagePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        marginBottom: 10,
    },
    previewImage: {
        width: 100,
        height: 100,
        marginVertical: 10,
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default AddPost;
