import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { ref } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { fs_storage } from '@/firebaseConfig';

const AddPost = () => {
   const reference = ref(fs_storage, 'black-t-shirt-sm.png');
   const [context, setContext] = useState('');
   const [roadmap, setRoadmap] = useState('');
   const [image, setImage] = useState<string | null>(null);


   const pickImage = async () => {
       let result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsEditing: true,
           aspect: [4, 3],
           quality: 1,
       });
       if (!result.canceled) {
           setImage(result.assets[0].uri);
       }
   };


   const handlePost = async () => {
       const post = {
           context,
           image,
           roadmap
       };


       console.log('Post:', post);
       alert('Post added successfully!');
   };


   return (
       <View style={{ flex: 1 }}>
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
           <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
               <MaterialIcons name="add-a-photo" size={24} color="black" />
               <Text>Pick an Image</Text>
           </TouchableOpacity>
           {image && <Image source={{ uri: image }} style={styles.previewImage} />}
           <TouchableOpacity style={styles.postButton} onPress={handlePost}>
               <Feather name="send" size={24} color="white" />
               <Text style={styles.buttonText}>Post</Text>
           </TouchableOpacity>
       </View>
   );




}


export default AddPost


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
