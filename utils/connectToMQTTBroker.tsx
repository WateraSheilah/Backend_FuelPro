import mqtt from 'mqtt';

const mqtt_broker = "broker.emqx.io";
const topic = "esp32/test";
const mqtt_username = "Anderson";
const mqtt_password = "12345678";
const mqtt_port = 1883;

interface MessageData {
    topic: string;
    temperature: string;
    sulfur: string;
    color: string;
}

// Update the latestMessage to support both MessageData or null
export const latestMessage: { data: MessageData | null } = { data: null };

export function connectToMQTTBroker() {
    const client = mqtt.connect(`mqtt://${mqtt_broker}:${mqtt_port}`, {
        clientId: "mqttjs01",
        username: mqtt_username,
        password: mqtt_password,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 4000
    });

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to topic '${topic}'`);
            } else {
                console.error('Subscribe error:', err);
            }
        });
    });

    client.on('message', (topic, message) => {
        console.log(`Received message on topic: ${topic}`);
        try {
            const parsedMessage = JSON.parse(message.toString());
            latestMessage.data = {
                topic,
                temperature: parsedMessage.temperature,
                sulfur: parsedMessage.sulfur,
                color: parsedMessage.color
            };
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    client.on('error', (err) => {
        console.error('Connection to MQTT broker failed:', err);
    });

    return client;
}
