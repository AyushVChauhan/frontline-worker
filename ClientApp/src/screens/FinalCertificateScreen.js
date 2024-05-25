import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import ipadd from "../../ipadd";
import { setFinal, setTraining } from "../../store/slices/CertificateSlice";
import { useDispatch, useSelector } from "react-redux";
import * as Linking from 'expo-linking';

const FinalCertificateScreen = () => {
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth);
    const certificates = useSelector((state) => state.certificates);
    const dispatch = useDispatch();


    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/finalCertificate?token=${auth.token}`
        );
        let data = await response.json();
        // console.log(data.topics);
        dispatch(setFinal(data.certificates));
        setLoading(false);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
        fetchData();
    }, []);
    async function down(certificateId)  {
        // console.log(certificateId);
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/generateCertificatePdf?token=${auth.token}&certificateId=${certificateId}`
        );
        let data = await response.json();
        // console.log(data);
        if(data.success == 1){
            Linking.openURL(`http://${ipadd.ip}:3000${data.uri}`);
        }
        else {
            Alert.alert("Error","Some Error has occured");
        }
    };
    const renderCertificateItem = ({ item }) => (
        <View style={styles.certificateItem}>
            <Text style={styles.certificateTitle}>{item.subjectId.name} Certificate</Text>
            <Text>Subject: {item.subjectId.name}</Text>
            <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
            <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => down(item._id)}
            >
                <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={certificates.final}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCertificateItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                        />
                    }
                />
            )}
        </View>
    )
}

export default FinalCertificateScreen

const styles = StyleSheet.create({
    con2:{
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
        justifyContent:"center",
        alignItems:"center"
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    certificateItem: {
        margin: 20,
        backgroundColor: "#f0f0f0",
        padding: 10,
    },
    certificateTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    pdfView: {
        flex: 1,
        marginTop: 10,
    },
    downloadButton: {
        backgroundColor: "#3498db",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    downloadButtonText: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
    },
})