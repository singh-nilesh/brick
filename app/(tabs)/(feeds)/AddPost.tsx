import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { fs_storage, Firestore_db } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { router, useFocusEffect } from 'expo-router';
import { Group, Task, Habit } from '@/utils/customTypes';
import { getFullGroup, getGroups } from '@/utils/taskService';
import { useSQLiteContext } from 'expo-sqlite';

const AddPost = () => {
    const { user } = useUser();
    const [context, setContext] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [groupList, setGroupList] = useState<Group[]>([]);
    const [groupDetail, setGroupDetail] = useState<{ goalTasks: Task[]; habitList: Habit[] } | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const db = useSQLiteContext();


    const fetchGroupList = async () => {
        const todo_list = (await getGroups(db)) as Group[];
        setGroupList(todo_list);
    };
    // Hook to fetch Groups
    useEffect(() => {
        fetchGroupList();
    }, []);


    const fetchFullGroup = async (tempGroup: Group) => {
        const result = await getFullGroup(db, tempGroup);
        setGroupDetail(result);
    }

    useEffect(() => {
        if (selectedGroup) {
            fetchFullGroup(selectedGroup);
        }
    }, [selectedGroup]);


    // Store the start date of the first habit in the group
    const startDate = groupDetail?.habitList[0]?.dtStart
        ? new Date(groupDetail.habitList[0].dtStart)
        : null;

    // Prepare the roadmap Json object
    const roadmap = selectedGroup
        ? {
            goal: selectedGroup.title,
            habits: groupDetail?.habitList.map((habit) => ({
                title: habit.title,
                weekDates: habit.byWeekDay,
                referenceLink: habit.referenceLink || null,
            })) || [],

            tasks: groupDetail?.goalTasks.map((task) => {
                const taskDueDate = task.dueAt ? new Date(task.dueAt) : null;
                let dueDayCount = 1; // Default to 1 day

                if (startDate && taskDueDate) {
                    dueDayCount = Math.round(
                        (taskDueDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
                    );
                }

                return {
                    title: task.title,
                    dueDay_count_from_start: dueDayCount,
                    reference: task.references || null,
                };
            }) || [],
        }
        : null;


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
                roadmap: JSON.stringify(roadmap),
                postTime: serverTimestamp(),
            });
            Alert.alert('Success', 'Post published successfully');
            setContext('');
            setImage(null);
            router.back();
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

            <View>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>Select a Group</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {groupList.map((group) => (
                        <TouchableOpacity
                            key={group.id}
                            onPress={() => setSelectedGroup(group)}
                            style={[styles.groupButton,
                            { backgroundColor: selectedGroup?.id === group.id ? 'black' : '#CCC', }
                            ]}>
                            <Text style={{ color: selectedGroup?.id === group.id ? 'white' : 'black' }}>{group.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

{/*
            <TouchableOpacity onPress={() => Alert.alert('Alert', 'Image picker pressed')} style={styles.imagePicker}>
                <MaterialIcons name="add-a-photo" size={24} color="black" />
                <Text>Pick an Image</Text>
            </TouchableOpacity>
            
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
*/}
            
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
    groupButton: {
        padding: 10,
        margin: 5,
        borderRadius: 5
    },
});

export default AddPost;
