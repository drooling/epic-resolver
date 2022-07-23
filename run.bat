@echo off

call npm i > nul
cls

echo In 10 seconds your web browser will open a new tab. After you login to your Epic Games account you will be met with a JSON string that looks like the one below
echo {"redirectUrl":"https://accounts.epicgames.com/fnauth?code=e2fb50e1b5e94e44b69ea51fe24c8f1d","authorizationCode":"e2fb50e1b5e94e44b69ea51fe24c8f1d","sid": null}
echo Please paste the whole string into this command prompt and press enter afterwards.

timeout /t 10 /nobreak > nul

Rem ^^ tell user what to do

start "" "https://www.epicgames.com/id/login?redirectUrl=https%%3A%%2F%%2Fwww.epicgames.com%%2Fid%%2Fapi%%2Fredirect%%3FclientId%%3Dec684b8c687f479fadea3cb2ad83f5c6%%26responseType%%3Dcode"

Rem ^^ open epic login page

set /p json=Enter JSON string here: 
set authCode=%json:~114,32%
Rem ^^ Get json and grep for auth code

echo %authCode% > refresh.txt
python fetch_refresh.py && node .

rem ^^ get refresh code and start server