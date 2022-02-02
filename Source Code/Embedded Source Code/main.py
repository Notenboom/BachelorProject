import machine
import esp32
from third_party import string
import network
import socket
import os
import utime
import ssl
from third_party import rsa
from umqtt.simple import MQTTClient
from ubinascii import b2a_base64
from machine import RTC, Pin
import ntptime
import ujson
import config
from machine import UART
import wifisetup
from time import sleep
try:
  import usocket as socket
except:
  import socket

def on_message(topic, message):
    print((topic,message))

def set_time():
    ntptime.settime()
    tm = utime.localtime()
    tm = tm[0:3] + (0,) + tm[3:6] + (0,)
    machine.RTC().datetime(tm)
    print('current time: {}'.format(utime.localtime()))

def b42_urlsafe_encode(payload):
    return string.translate(b2a_base64(payload)[:-1].decode('utf-8'),{ ord('+'):'-', ord('/'):'_' })

def create_jwt(project_id, private_key, algorithm, token_ttl):
    print("Creating JWT...")
    private_key = rsa.PrivateKey(*private_key)

    '''Epoch_offset is needed because micropython epoch is 2000-1-1 and unix is 1970-1-1. Adding 946684800 (30 years)'''
    epoch_offset = 946684800
    claims = {
            #The time that the token was issued at
            'iat': utime.time() + epoch_offset,
            #The time the token expires.
            'exp': utime.time() + epoch_offset + token_ttl,
            #The audience field should always be set to the GCP project id.
            'aud': project_id
    }

    #This only supports RS256 at this time.
    header = { "alg": algorithm, "typ": "JWT" }
    content = b42_urlsafe_encode(ujson.dumps(header).encode('utf-8'))
    content = content + '.' + b42_urlsafe_encode(ujson.dumps(claims).encode('utf-8'))
    signature = b42_urlsafe_encode(rsa.sign(content,private_key,'SHA-256'))
    return content+ '.' + signature #signed JWT

"""Create our MQTT client. The client_id is a unique string that identifies
    this device. For Google Cloud IoT Core, it must be in the format below."""
def get_mqtt_client(project_id, cloud_region, registry_id, device_id, jwt):
    client_id = 'projects/{}/locations/{}/registries/{}/devices/{}'.format(project_id, cloud_region, registry_id, device_id)
    print('Sending message with password {}'.format(jwt))
    client = MQTTClient(client_id.encode('utf-8'),server=config.google_cloud_config['mqtt_bridge_hostname'],port=config.google_cloud_config['mqtt_bridge_port'],user=b'ignored',password=jwt.encode('utf-8'),ssl=True)
    client.set_callback(on_message)
    client.connect()
    client.subscribe('/devices/{}/config'.format(device_id), 1)
    client.subscribe('/devices/{}/commands/#'.format(device_id), 1)
    return client

greenLed = machine.Pin(13, machine.Pin.OUT)
blueLed = machine.Pin(27, machine.Pin.OUT)
greenLed.value(1)
blueLed.value(1)

wlan = wifisetup.get_connection()
if wlan is None:
    blueLed.value(0)
    print("Could not initialize the network connection.")
    while True:
        pass  

print("NETWORK GOOD")

greenLed.value(0)
blueLed.value(0)

set_time()

greenLed.value(1)
blueLed.value(1)

jwt = create_jwt(config.google_cloud_config['project_id'], config.jwt_config['private_key'], config.jwt_config['algorithm'], config.jwt_config['token_ttl'])
client = get_mqtt_client(config.google_cloud_config['project_id'], config.google_cloud_config['cloud_region'], config.google_cloud_config['registry_id'], config.google_cloud_config['device_id'], jwt)

uart = UART(1, 9600)
uart.init(9600, bits=8, parity=None, stop=1, tx=17, rx=16, timeout=10)

greenLed.value(1)
blueLed.value(0)

while True:
    '''Write to the uart ine to request new data from arduino'''
    uart.write('get')
    data = uart.readline()
    #print(data)
    
    message = {
        "DeviceId": config.google_cloud_config['device_id'],
        "Consumption": data
    }
    if wlan.isconnected():
        print("Publishing message "+str(ujson.dumps(message)))
        '''Create topic and send data to the Google IOT Core'''
        mqtt_topic = '/devices/{}/{}'.format(config.google_cloud_config['device_id'], 'state')
        client.publish(mqtt_topic.encode('utf-8'), ujson.dumps(message).encode('utf-8'))
        utime.sleep(5)  # Delay in seconds.
    else:
        print("wlan error")
        greenLed.value(1)
        blueLed.value(0)
        utime.sleep(1)
        greenLed.value(0)
        blueLed.value(1)
        utime.sleep(1)
    #client.check_msg() # Check for new messages on subscription
    
    
