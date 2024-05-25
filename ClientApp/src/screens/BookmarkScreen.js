
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ipadd from "../../ipadd";
import { setModules } from "../../store/slices/ModuleSlice";

const BookmarksScreen = ({ navigation }) => {
    const auth = useSelector((state) => state.auth);
    const subject = useSelector((state) => state.subjects);
    const [myArr, setMyArr] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        let res = await fetch(`http://${ipadd.ip}:3000/worker/getBookmarks?token=${auth.token}&subjectId=${subject.mySubjectId}`);
        let data = await res.json();
        // console.log(data);
        let myArr = [];
        data.bookmarks.forEach(ele => {
            myArr.push(ele[1]);
        })
        setMyArr(myArr);
        setLoading(false);
        // dispatch(setModules(data.modules));
    }

    const renderBookmarkItem = ({ item }) => {
        return (
            <View style={styles.moduleContainer}>
                <Text style={styles.moduleName}>{item.moduleName}</Text>
                {item.topics.map(topic => {
                    return (
                        <View style={styles.bookmarkItem} key={topic.topicId}>
                            <Text>{topic.topic}</Text>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate("Modules", {screen:"OneModule", params:{moduleId:item.moduleId}});
                            }}>
                                <Text style={styles.bookmarkIcon}>View Topic</Text>
                            </TouchableOpacity>
                        </View>)
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={myArr}
                    keyExtractor={(module) => module.moduleId}
                    renderItem={renderBookmarkItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    moduleContainer: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: "white",
        borderRadius: 10,
    },
    moduleName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    bookmarkItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
    },
    bookmarkIcon: {
        color: "#3498db",
    },
});

export default BookmarksScreen;
