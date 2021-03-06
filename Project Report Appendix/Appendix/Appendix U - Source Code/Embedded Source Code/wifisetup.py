import network
import socket
import ure
import time
import machine

'''Default soft access point credentials'''
ap_ssid = "Bachelor_Setup"
ap_password = "esp32setup"
ap_authmode = 3  # WPA2

'''Settings file to hold user input credentials'''
NETWORK_PROFILES = 'wifi.dat'

'''Setup esp32 wifi'''
wlan_ap = network.WLAN(network.AP_IF)
wlan_sta = network.WLAN(network.STA_IF)

server_socket = None

'''Try to connect to the wifi in the NETWORK_PROFILES if existing
   Otherwise start a local hosted webpage for connection manager on 192.168.4.1'''
def get_connection():
    '''First check if there already is any connection'''
    if wlan_sta.isconnected():
        return wlan_sta

    connected = False
    try:
        '''ESP connecting to WiFi takes time, wait a bit and try again'''
        time.sleep(3)
        if wlan_sta.isconnected():
            return wlan_sta

        '''Read known network profiles from file'''
        profiles = read_profiles()

        '''Search WiFis in range'''
        wlan_sta.active(True)
        networks = wlan_sta.scan()

        AUTHMODE = {0: "open", 1: "WEP", 2: "WPA-PSK", 3: "WPA2-PSK", 4: "WPA/WPA2-PSK"}
        for ssid, bssid, channel, rssi, authmode, hidden in sorted(networks, key=lambda x: x[3], reverse=True):
            ssid = ssid.decode('utf-8')
            encrypted = authmode > 0
            print("ssid: %s chan: %d rssi: %d authmode: %s" % (ssid, channel, rssi, AUTHMODE.get(authmode, '?')))
            if encrypted:
                if ssid in profiles:
                    password = profiles[ssid]
                    connected = do_connect(ssid, password)
                else:
                    print("skipping unknown encrypted network")
            else:
                '''Uncomment this if you want to be able to allow connections to open networks'''
                #connected = do_connect(ssid, None)
            if connected:
                break

    except OSError as e:
        print("exception", str(e))

    '''start web server for connection manager'''
    if not connected:
        connected = start()

    return wlan_sta if connected else None

'''Read stored data from NETWORK_PROFILES for connection to stored wifi credentials'''
def read_profiles():
    with open(NETWORK_PROFILES) as f:
        lines = f.readlines()
    profiles = {}
    for line in lines:
        ssid, password = line.strip("\n").split(";")
        profiles[ssid] = password
    return profiles

'''Write data to NETWORK_PROFILES from the connection manager for further wifi connections'''
def write_profiles(profiles):
    lines = []
    for ssid, password in profiles.items():
        lines.append("%s;%s\n" % (ssid, password))
    with open(NETWORK_PROFILES, "w") as f:
        f.write(''.join(lines))

'''Connect to the wifi with the given credentials'''
def do_connect(ssid, password):
    wlan_sta.active(True)
    if wlan_sta.isconnected():
        return None
    print('Trying to connect to %s...' % ssid)
    wlan_sta.connect(ssid, password)
    for retry in range(100):
        connected = wlan_sta.isconnected()
        if connected:
            break
        time.sleep(0.1)
        print('.', end='')
    if connected:
        print('\nConnected. Network config: ', wlan_sta.ifconfig())
    else:
        print('\nFailed. Not Connected to: ' + ssid)
    return connected

'''Send HTTP header'''
def send_header(client, status_code=200, content_length=None ):
    client.sendall("HTTP/1.0 {} OK\r\n".format(status_code))
    client.sendall("Content-Type: text/html\r\n")
    if content_length is not None:
      client.sendall("Content-Length: {}\r\n".format(content_length))
    client.sendall("\r\n")

'''Send HTTP response to connected client'''
def send_response(client, payload, status_code=200):
    content_length = len(payload)
    send_header(client, status_code, content_length)
    if content_length > 0:
        client.sendall(payload)
    client.close()

'''Setup connection webpage with scanned ssid's within range'''
def handle_root(client):
    wlan_sta.active(True)
    ssids = sorted(ssid.decode('utf-8') for ssid, *_ in wlan_sta.scan())
    send_header(client)
    client.sendall("""\
        <html>
            <h1 style="color: #5e9ca0; text-align: center;">
                <span style="color: #B7410E;">
                    Bachelor device IoT energy monitor
                </span>
            </h1>
            <h3 style="color: #000000; text-align: center;">
                <span style="color: #000000;">
                    First time device Wi-Fi setup/No connection availible device Wi-Fi setup.
                </span>
            </h3>
            <h5 style="color: #5e9ca0; text-align: center;">
                <span style="color: #B7410E;">
                    Select your Wi-Fi ssid, provide your password and press submit.
                </span>
            </h5>
            <form action="configure" method="post">
                <table style="margin-left: auto; margin-right: auto;">
                    <tbody>
    """)
    while len(ssids):
        ssid = ssids.pop(0)
        client.sendall("""\
                        <tr>
                            <td colspan="2">
                                <input type="radio" name="ssid" value="{0}" />{0}
                            </td>
                        </tr>
        """.format(ssid))
    client.sendall("""\
                         <tr>
                            <td>Password:</td>
                            <td><input name="password" type="password" /></td>
                        </tr>
                    </tbody>
                </table>
                <p style="text-align: center;">
                    <input type="submit" value="Submit" />
                </p>
            </form>
            <p>&nbsp;</p>
            <hr />
            <h5>
                <span style="color: #ff0000; text-align: center;">
                    Your ssid and password information will be saved internally in the device.<br>
                    Your ssid and password will only be used by the device and is not send externally or available to users/developers.<br>
                    Deletion of this information is currently not available to users.<br>
                    The method to delete this information can be provided upon request.<br>
                </span>
            </h5>
        </html>
    """)
    client.close()

'''Handler to handle the request that was submitted and providing user feedback on succes or failed connection'''
def handle_configure(client, request):
    match = ure.search("ssid=([^&]*)&password=(.*)", request)

    if match is None:
        send_response(client, "Parameters not found", status_code=400)
        return False
    try:
        ssid = match.group(1).decode("utf-8").replace("%3F", "?").replace("%21", "!")
        password = match.group(2).decode("utf-8").replace("%3F", "?").replace("%21", "!")
    except Exception:
        ssid = match.group(1).replace("%3F", "?").replace("%21", "!")
        password = match.group(2).replace("%3F", "?").replace("%21", "!")

    if len(ssid) == 0:
        send_response(client, "SSID must be provided", status_code=400)
        return False

    if do_connect(ssid, password):
        response = """\
            <html>
                <center>
                    <br><br>
                    <h1 style="color: #5e9ca0; text-align: center;">
                        <span style="color: #ff0000;">
                            Successfully connected to WiFi network %(ssid)s.
                        </span>
                    </h1>
                    <br><br>
                </center>
            </html>
        """ % dict(ssid=ssid)
        send_response(client, response)
        try:
            profiles = read_profiles()
        except OSError:
            profiles = {}
        profiles[ssid] = password
        write_profiles(profiles)

        time.sleep(5)

        return True
    else:
        response = """\
            <html>
                <center>
                    <h1 style="color: #5e9ca0; text-align: center;">
                        <span style="color: #ff0000;">
                            Could not connect to WiFi network %(ssid)s.
                        </span>
                    </h1>
                    <br><br>
                    <form>
                        <input type="button" value="Go back!" onclick="history.back()"></input>
                    </form>
                </center>
            </html>
        """ % dict(ssid=ssid)
        send_response(client, response)
        return False

'''Error handling when path is not found'''
def handle_not_found(client, url):
    send_response(client, "Path not found: {}".format(url), status_code=404)

'''Closing socket to prevent socket ocupation problems'''
def stop():
    global server_socket

    if server_socket:
        server_socket.close()
        server_socket = None

'''WifiSetup start method, to open the soft ap and start listening for clients'''
def start(port=80):
    
    greenLed = machine.Pin(13, machine.Pin.OUT)
    blueLed = machine.Pin(27, machine.Pin.OUT)
    greenLed.value(0)
    blueLed.value(1)
    
    global server_socket

    addr = socket.getaddrinfo('0.0.0.0', port)[0][-1]

    stop()

    wlan_sta.active(True)
    wlan_ap.active(True)

    wlan_ap.config(essid=ap_ssid, password=ap_password, authmode=ap_authmode)

    server_socket = socket.socket()
    server_socket.bind(addr)
    server_socket.listen(1)

    print('Connect to WiFi ssid ' + ap_ssid + ', default password: ' + ap_password)
    print('and access the ESP via your favorite web browser at 192.168.4.1.')
    print('Listening on:', addr)

    while True:
        if wlan_sta.isconnected():
            return True

        client, addr = server_socket.accept()
        print('client connected from', addr)
        try:
            client.settimeout(5.0)

            request = b""
            try:
                while "\r\n\r\n" not in request:
                    request += client.recv(512)
            except OSError:
                pass

            print("Request is: {}".format(request))
            if "HTTP" not in request:  # skip invalid requests
                continue

            try:
                url = ure.search("(?:GET|POST) /(.*?)(?:\\?.*?)? HTTP", request).group(1).decode("utf-8").rstrip("/")
            except Exception:
                url = ure.search("(?:GET|POST) /(.*?)(?:\\?.*?)? HTTP", request).group(1).rstrip("/")
            print("URL is {}".format(url))

            if url == "":
                handle_root(client)
            elif url == "configure":
                handle_configure(client, request)
            else:
                handle_not_found(client, url)

        finally:
            client.close()