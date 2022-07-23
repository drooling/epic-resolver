import requests
import json
import os

session = requests.Session()

code = open('./refresh.txt', 'r').read().strip()
resp = session.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", headers={"Content-Type": "application/x-www-form-urlencoded", "Authorization": "basic ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ="}, data=dict(grant_type="authorization_code", code=code))

try:
    keyfile = open('./valid_keys.json', 'w')
    json.dump({"refreshToken": resp.json()['refresh_token']}, keyfile)
    keyfile.close()
    os.remove('./refresh.txt')
except KeyError:
    exit(1)
