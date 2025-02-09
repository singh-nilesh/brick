import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

const ExplorePage = () => {
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<{ id: string; title: string; content: string; likes: number }[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<{ id: string; title: string; content: string; likes: number }[]>([]);

  useEffect(() => {
    // Fetch posts from the backend (replace with your data source)
    const fetchPosts = async () => {
      const fetchedPosts = [
        { id: '1', title: 'Morning Routine', content: 'Start your day with a run!', likes: 5 },
        { id: '2', title: 'Productivity Hacks', content: 'Use Pomodoro technique!', likes: 8 },
      ];
      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
    };
    fetchPosts();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = posts.filter(post => post.title.toLowerCase().includes(text.toLowerCase()));
    setFilteredPosts(filtered);
  };

  const handleLike = (postId: string) => {
    setFilteredPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const renderItem = ({ item }: { item: { id: string; title: string; content: string; likes: number } }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}   
        onPress={() => handleLike(item.id)}>
          <FontAwesome name="thumbs-up" size={20} color="blue" />
          <Text>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <FontAwesome name="comment" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="leftcircleo" size={30} color="black" />
      </TouchableOpacity>

      {/* Explore Title */}
      <Text style={{alignSelf:'center', fontSize:25, }}>Explore</Text>
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search posts..."
        value={search}
        onChangeText={handleSearch}
      />
      
      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
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
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postContent: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  postActions: {
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
