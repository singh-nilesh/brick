import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Firestore_db } from '../../../firebaseConfig';

interface PostProps {
  id: string;
  context: string;
  roadmap: string;
  image: string;
  profileImage: string;
  userId: string;
  likes: string[]; // array of user IDs
}

const ExplorePage = () => {
  const { user, isSignedIn } = useUser();
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostProps[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(Firestore_db, 'posts'));
      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PostProps[];

      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/LandingPage');
    }
    fetchPosts();
  }, [isSignedIn]);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = posts.filter((post) =>
      post.context.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  const handleLike = async (postId: string, likes: string[]) => {
    if (!user) return;

    const postRef = doc(Firestore_db, 'posts', postId);
    const isLiked = likes.includes(user.id);
    const updatedLikes = isLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id];

    try {
      await updateDoc(postRef, { likes: updatedLikes });

      setFilteredPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  const renderPosts = ({ item }: { item: PostProps }) => {
    // Ensure likes is always an array
    const likesArray = Array.isArray(item.likes) ? item.likes : [];
    const isLikedByUser = user ? likesArray.includes(user.id) : false;

    return (
      <View style={styles.postContainer}>
        <View style={styles.userInfo}>
          <Text>{item.userId}</Text>
        </View>

        <Text style={styles.postContent}>{item.context}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id, likesArray)}
          >
            <FontAwesome name="thumbs-up" size={20} color={isLikedByUser ? 'blue' : 'grey'} />
            <Text>{likesArray.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, {
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 10,
          }]} 
          onPress={() => {
            router.push({
              pathname: "/GroupOverview",
              params: { data: item.roadmap },
            })
          }}>
            <Text style={{paddingVertical:3, paddingHorizontal:10}}>See Roadmap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        keyExtractor={(item) => item.id}
        renderItem={renderPosts}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/AddPost')}
      >
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
    backgroundColor: '#fff',
  },
  title: {
    alignSelf: 'center',
    fontSize: 25,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    marginVertical: 10,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 30,
  },
});
