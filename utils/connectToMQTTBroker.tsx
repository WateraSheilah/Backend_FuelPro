// utils/connectToMQTTBroker.ts

import mqtt, { MqttClient } from 'mqtt';

// MQTT Broker settings
const mqtt_broker = "broker.emqx.io";
const topic = "esp32/test";
const mqtt_username = "Anderson";
const mqtt_password = "12345678";
const mqtt_port = 1883;

let client: MqttClient;

export function connectToMQTTBroker() {
    client = mqtt.connect(`mqtt://${mqtt_broker}:${mqtt_port}`, {
        clientId: "mqttjs01",
        username: mqtt_username,
        password: mqtt_password,
        clean: true, // Ensures the client starts with a clean session (recommended)
        reconnectPeriod: 1000, // Reconnect interval in milliseconds
        connectTimeout: 4000 // Time out period in milliseconds
    });

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        client.subscribe(topic, (err: Error | null) => {
            if (!err) {
                console.log(`Subscribed to topic '${topic}'`);
                client.publish(topic, 'Hello MQTT', {}, (error: Error | null) => {
                    if (error) {
                        console.error('Publish error:', error);
                    } else {
                        console.log('Message published to topic');
                    }
                });
            } else {
                console.error('Subscribe error:', err);
            }
        });
    });

    client.on('message', (topic: string, message: Buffer | string) => {
        // Assuming message is converted to string for logging
        console.log(`Received message: ${message.toString()} on topic: ${topic}`);
    });

    client.on('error', (err: Error) => {
        console.error('Connection to MQTT broker failed:', err);
    });
}


