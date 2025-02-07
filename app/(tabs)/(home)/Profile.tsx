import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSQLiteContext } from "expo-sqlite";
import { deleteGroup, getGroupOverview } from "@/utils/taskService";
import JsonInput from "@/components/JsonInput";
import JsonGuide from "@/components/JsonGuide";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


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
  const [refreshDB, setRefreshDB] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupsProps | null>(null);

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

  useEffect(() => {
      fetchGroups();
    }, [activeGroup, refreshDB]);


  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    console.log(option);
    setMenuVisible(false);
  };

  const onDelete = async (grpId: number) => {
    await deleteGroup(db, grpId);
    setRefreshDB(!refreshDB);
  };


  const renderGroup = ({ item }: { item: any }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={{ flexDirection: 'row' }}>
          <Pressable style={styles.deleteIcon} onPress={() => onDelete(item.id)}>
            <MaterialCommunityIcons name="delete" size={27} color="black" />
          </Pressable>
        </View>
      )}
    >
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
    </Swipeable>
  );

  return (
    <View style={styles.container}>

      {/* Back Button */}
      <AntDesign name="leftcircleo" size={30} color="black" style={styles.backButton}
        onPress={() => router.back()}
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

          <AntDesign style={{ padding: 7 }} name="infocirlceo" size={24} color="black" onPress={() => setJsonGuideVisible(true)} />

          <TouchableOpacity style={styles.menuItem}
            onPress={() => setJsonVisible(true)}
          >
            <Text style={styles.menuText}>Paste JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}
            onPress={() => router.push("/(tabs)/(home)/FetchAiResponse")}
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
              pathname: "/(tabs)/(home)/GroupOverview",
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
    marginHorizontal: 5,
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
  deleteIcon: {
    backgroundColor: '#F8C4B4',
    marginTop: 2,
    marginBottom: 16,
    borderEndEndRadius: 15,
    borderTopEndRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
},
});

export default Profile;
