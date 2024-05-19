import {MqttClient} from "mqtt";

let client: MqttClient;
export function disconnectFromMQTTBroker() {
    if (client) {
        console.log('Disconnecting from MQTT Broker');
        client.end();
    }
}