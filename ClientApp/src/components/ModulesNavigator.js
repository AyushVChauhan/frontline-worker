import { createStackNavigator } from "@react-navigation/stack";
import ModulesScreen from "../screens/ModulesScreen";
import Topics from "../screens/Topics";
import Module from "../screens/Module";
import Discussion from "../screens/Discussion";

const Stack = createStackNavigator();

export default function ModulesNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Group>
                <Stack.Screen name="AllModules" component={ModulesScreen} />
                <Stack.Screen name="OneModule" component={Module} />
                <Stack.Screen name="Topic" component={Topics} />
                <Stack.Screen name="Discussion" component={Discussion} options={{headerShown:true}}/>
            </Stack.Group>
        </Stack.Navigator>
    );
}

//Module Name
//2/6 topics
//Rating 4.5/5 (10)
//Practice Quiz

//Quiz Name
//Quiz Date from-to
//Quiz Duration
//Quiz Marks
