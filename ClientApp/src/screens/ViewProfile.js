import React from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import { useSelector } from "react-redux";
import ipadd from "../../ipadd";
// import Animated, {
//     SharedTransition,
//     withSpring,
// } from "react-native-reanimated";

const ViewProfileScreen = () => {
    const profile = useSelector((state) => state.profile);
    const subject = useSelector((state) => state.subjects);

    function formatDate(date) {
        function padzero(string) {
            string = string.toString();
            return string.padStart(2, "0");
        }
        let newDate = new Date(date);
        return (
            padzero(newDate.getDate()) +
            "/" +
            padzero(newDate.getMonth() + 1) +
            "/" +
            newDate.getFullYear() +
            " - " +
            padzero(newDate.getHours()) +
            ":" +
            padzero(newDate.getMinutes())
        );
    }
    // const customTransition = SharedTransition.custom((values) => {
    //     "worklet";
    //     return {
    //         height: withSpring(values.targetHeight),
    //         width: withSpring(values.targetWidth),
    //         originX: withSpring(values.targetOriginX),
    //         originY: withSpring(values.targetOriginY),
    //     };
    // });
    return (
        <View style={styles.container}>
            <View style={styles.profileImage}>
                <Image
                    source={{
                        uri: `http://${ipadd.ip}:3000/files/workers/${profile.profile.photo}`,
                    }}
                    style={styles.userPhoto}
                />
                {/* <Animated.Image
                    source={{
                        uri: `http://${ipadd.ip}:3000/files/workers/${profile.profile.photo}`,
                    }}
                    style={styles.userPhoto}
                    sharedTransitionTag="tag"
                    // sharedTransitionStyle={customTransition}
                /> */}
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Username :</Text>
                <Text style={styles.value}>{profile.profile.username}</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Name :</Text>
                <Text style={styles.value}>{profile.profile.name}</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Email :</Text>
                <Text style={styles.value}>{profile.profile.email}</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Date of Birth :</Text>
                <Text style={styles.value}>
                    {formatDate(profile.profile.dateOfBirth).slice(0, 10)}
                </Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>District :</Text>
                <Text style={styles.value}>
                    {profile.profile.districtId.name}
                </Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Mobile No. :</Text>
                <Text style={styles.value}>{profile.profile.phone}</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Aadhar Card No. :</Text>
                <Text style={styles.value}>{profile.profile.aadharCard}</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.label}>Subject :</Text>
                <Text style={styles.value}>{subject.mySubjectName}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    profileInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
        width: "70%",
        alignSelf: "center",
    },
    profileImage: {
        alignSelf: "center",
        
    },
    userPhoto: {
        width: 150,
        height: 150,
        alignSelf: "center",
        marginTop: 60,
        marginBottom: 20,
		borderRadius:80
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
    },
    value: {
        fontSize: 16,
        // width: "60%"
    },
});

export default ViewProfileScreen;
