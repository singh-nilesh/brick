    import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
    import React, { useState } from 'react';
    import Feather from '@expo/vector-icons/Feather';
    import Swipeable from 'react-native-gesture-handler/Swipeable';
    import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
    import { Todo } from '../utils/customTypes';
    import { SQLiteDatabase } from 'expo-sqlite';

    interface TodoListItemsProps {
        db: SQLiteDatabase;
        item: Todo;
        markDone: (item: Todo) => void;
        onDelete?: (item:Todo) => void;
        onEdit?: (newTask: string, item:Todo) => void;
        isSubtask?: boolean;
    }

    const TodoListItems = ({ isSubtask, item, onDelete, onEdit, markDone }: TodoListItemsProps) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editedTitle, setEditedTitle] = useState<string>(item.title);

            return (
                <Swipeable
                    renderRightActions={() =>
                        !isSubtask ? (
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable style={styles.deleteIcon} onPress={() => onDelete?.(item)}>
                                    <MaterialCommunityIcons name="delete" size={27} color="black" />
                                </Pressable>
                            </View>
                        ) : null
                    }
                >
                    <View style={{ flexDirection: 'row' }}>
                        {/* Checkbox */}
                        <Pressable style={{ padding: 5 }} onPress={() => markDone(item)}>
                            <Feather
                                name={item.status ? 'check-circle' : 'circle'}
                                size={24}
                                color={item.status ? 'grey' : 'black'}
                                style={{ marginRight: 10 }}
                            />
                        </Pressable>

                        {/* Editable task title */}

                        {isEditing ? (
                            <TextInput
                                value={editedTitle}
                                onChangeText={setEditedTitle}
                                style={[styles.taskTitle, styles.input]}
                                autoFocus
                                onBlur={() => {
                                    if (editedTitle.trim().length > 0) {
                                        onEdit?.(editedTitle.trim(), item);
                                    } else {
                                        setEditedTitle(item.title);
                                    }
                                    setIsEditing(false);
                                }}
                            />
                        ) : (
                            <Pressable onPress={() => isSubtask ? setIsEditing(false) : setIsEditing(true)}>
                                <Text
                                    style={[
                                        styles.taskTitle,
                                        { color: item.status ? 'grey' : 'black' },
                                        { textDecorationLine: item.status ? 'line-through' : 'none' },
                                    ]}
                                >
                                    {item.title}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </Swipeable>
            );
        };

        export default TodoListItems;

        const styles = StyleSheet.create({
            taskTitle: {
                fontFamily: 'InterSemi',
                fontSize: 18,
                color: 'black',
                flex: 1,
                paddingRight: 40,
                paddingTop: 4
            },
            input: {
                borderBottomWidth: 0,
                paddingVertical: 2,
                flex: 1
            },
            deleteIcon: {
                backgroundColor: '#F8C4B4',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
            },
        });
