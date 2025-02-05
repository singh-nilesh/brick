import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSQLiteContext } from "expo-sqlite";
import { getGroupOverview } from "@/utils/taskService";
import JsonInput from "@/components/JsonInput";
import JsonGuide from "@/components/JsonGuide";


const data = {
  goal: "Become Data Scientist",
  habits: [
    {
      title: "Practice Python programming",
      weekDates: [1, 3, 5],
      referenceLink: "https://realpython.com",
    },
    {
      title: "Review data science concepts",
      weekDates: [2, 4],
      referenceLink: null,
    },
    {
      title: "Participate in Kaggle competitions",
      weekDates: [6],
      referenceLink: "https://kaggle.com",
    },
  ],
  tasks: [
    {
      title: "Install and set up Python and Jupyter",
      dueDay_count_from_start: 1,
      reference: "https://anaconda.com",
    },
    {
      title: "Complete a Python for Data Science course",
      dueDay_count_from_start: 7,
      reference: "https://coursera.org",
    },
    {
      title: "Learn Pandas and Numpy basics",
      dueDay_count_from_start: 14,
      reference: "https://datacamp.com",
    },
    {
      title: "Complete an end-to-end data project",
      dueDay_count_from_start: 21,
      reference: null,
    },
    {
      title: "Learn Matplotlib and Seaborn",
      dueDay_count_from_start: 28,
      reference: "https://matplotlib.org",
    },
    {
      title: "Read articles on Machine Learning",
      dueDay_count_from_start: 35,
      reference: "https://medium.com",
    },
    {
      title: "Build a data science portfolio",
      dueDay_count_from_start: 42,
      reference: null,
    },
  ],
};

interface GroupsProps {
  id: number;
  title: string;
  description: string;
  bgColor: string;
  taskCount: number;
  completedTask: number;
  habitCount: number;
}

const Profile = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [jsonVisible, setJsonVisible] = useState(false);
  const [jsonGuideVisible, setJsonGuideVisible] = useState(false);
  const [groupList, setGroupList] = useState<GroupsProps[]>([]);
  const db = useSQLiteContext();

  // Fetch groups
  const fetchGroups = async () => {
    let results = await getGroupOverview(db);
    setGroupList(results);
  }

  // Hook to fetch todos from the database
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [db])
  );


  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    console.log(option);
    setMenuVisible(false);
  };


  const renderGroup = ({ item }: { item: any }) => (
    <View style={styles.card}>

      <View style={styles.cardContent}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <Text style={styles.details}>{item.description}</Text>
      </View>

      <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingHorizontal: 10 }}>
        <Text style={styles.details}>Habits: {item.habitCount}</Text>
        <Text style={styles.details}>Tasks {item.completedTask}/{item.taskCount}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Back Button */}
      <AntDesign name="leftcircleo" size={30} color="black" style={styles.backButton}
        onPress={() => router.push('/(home)/(tasks)/Today')}
      />

      {/* Header */}
      <Text style={styles.header}>Groups</Text>
      <MaterialIcons name="format-list-bulleted-add" size={30} color="black" style={styles.addGroup}
        onPress={() => toggleMenu()} />

      {/* Group List */}
      <FlatList
        data={groupList}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      {/* Floating Menu */}
      {menuVisible && (
        <View style={styles.floatingMenu}>

          <AntDesign style={{ padding: 7 }} name="infocirlceo" size={24} color="black" onPress={() =>setJsonGuideVisible(true)} />

          <TouchableOpacity style={styles.menuItem}
            onPress={() => setJsonVisible(true)} 
          >
            <Text style={styles.menuText}>Paste JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}
            onPress={() => router.push({
              pathname: "/(home)/GroupOverview",
              params: { data: JSON.stringify(data) },
            })}
          >
            <Text style={styles.menuText}>AI generated</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* JSON Input */}
      {jsonVisible && (
        <JsonInput
          isVisible={jsonVisible}
          onClose={() => setJsonVisible(false)}
          
            onSave={(jsonText) => {
              router.push({
                pathname: "/(home)/GroupOverview",
                params: { data: JSON.stringify(jsonText) },
              })
              setJsonVisible(false)
            }}
        />
      )}

      {/* Json Guide */}
      {JsonGuide && (
        <JsonGuide
          isVisible={jsonGuideVisible}
          onClose={() => setJsonGuideVisible(false)}
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  addGroup: {
    textAlign: "right",
    marginBottom: 10,
    marginRight: 16,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    flexDirection: "column",
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "gray",
    marginVertical: 4,
  },
  floatingMenu: {
    position: "absolute",
    flexDirection: "row",
    top: 50, // Adjusted position above the "+" button
    right: 65,
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 10,
    borderWidth: 5,
  },
  menuItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  menuText: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 15,
    color: "white",
  },
});

export default Profile;
