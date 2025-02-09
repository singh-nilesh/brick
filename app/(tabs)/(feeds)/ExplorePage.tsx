import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Firestore_db } from '@/firebaseConfig';


interface PostProps {
  id: string,
  context: string,
  roadmap: string,
  image: string,
  profileImage: string,
  userId: string,
  likes: number,
}


const ExplorePage = () => {
  const { user, isSignedIn } = useUser();
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);


  useEffect(() => {
    if (!isSignedIn) {
      router.push('/LandingPage');
    }


    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(Firestore_db, 'posts'));
        const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostProps));
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };


    fetchPosts();
  }, [isSignedIn]);


  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = posts.filter(post => post.context.toLowerCase().includes(text.toLowerCase()));
    setFilteredPosts(filtered);
  };


  const handleLike = async (postId: string, currentLikes: number) => {
    const postRef = doc(Firestore_db, 'posts', postId);
    try {
      await updateDoc(postRef, { likes: currentLikes + 1 });
      setFilteredPosts(prev => prev.map(post => post.id === postId ? { ...post, likes: currentLikes + 1 } : post));
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };




  const renderPosts = ({ item }: { item: PostProps }) => (
    <View style={styles.postContainer}>


      { /* user info */}
      <View style={styles.userInfo}>
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        <Text>{item.userId}</Text>
      </View>


      { /* post content */}
      <Text style={styles.postContent}>{item.context}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}


      { /* like & roadmap */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id, item.likes)}>
          <FontAwesome name="thumbs-up" size={20} color="blue" />
          <Text>{item.likes}</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.actionButton}>
          <Text >See Roadmap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="leftcircleo" size={30} color="black" />
      </TouchableOpacity>


      <Text style={styles.title}>Explore</Text>


      <TextInput
        style={styles.searchBar}
        placeholder="Search posts..."
        value={search}
        onChangeText={handleSearch}
      />


      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderPosts}
      />


      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/AddPost')}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>


    </View>
  );
};


export default ExplorePage;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  title: {
    alignSelf: 'center',
    fontSize: 25
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    marginVertical: 10
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  postContent: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 5
  },
  postActions: {
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 30
  },
});




