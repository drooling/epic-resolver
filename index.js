//require('dotenv').config();

const fs = require('fs');
const os = require('os');
const open = require('open');
const axios = require('axios');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { Job } = require('@simpleview/async-cron');

const server = express();
server.disable('x-powered-by');
server.set('view engine', 'ejs');
server.use(compression());
server.use(morgan('combined'));
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));

var validAccessToken;

function updateValue(key, value) {
    const current = JSON.parse(fs.readFileSync("./valid_keys.json", {encoding: "utf-8"}));
    current[key] = value;
    fs.writeFileSync("./valid_keys.json", JSON.stringify(current, null, 4));
}

const refreshJob = new Job({ schedule: "*/30 * * * *" }, async () => {
    let validRefreshToken = () => JSON.parse(fs.readFileSync("./valid_keys.json", {encoding: "utf-8"})).refreshToken
    await axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", `grant_type=refresh_token&refresh_token=${validRefreshToken()}`,
    {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "basic ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ="
        }
    }).then(async (resp) => {
        validAccessToken = resp.data.access_token;
        updateValue("refreshToken", resp.data.refresh_token);
    }).catch(async (err) => {
        console.log("Error, please execute run.bat again");
        process.exit(1);
    });
});

server.get('/', (req, res) => {
    res.render('index');
});

server.post('/resolve', async (req, res) => {
    if (req.body.target) {
        let endpoint;
        switch (req.body.type) {
            case 'displayName':
                endpoint = `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/${req.body.target}`;
                break;
            case 'email':
                endpoint = `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/email/${req.body.target}`;
                break;
            case 'accountId':
                endpoint = `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${req.body.target}`;
                break;
            default:
                return res.render('error', { errorMessage: 'Invalid specifier type' });
        }
        await axios.get(endpoint, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `bearer ${validAccessToken}`
            }
        }).then((resp) => {
            res.render('success', { account: resp.data });
        }).catch((_) => {
            res.render('error', { errorMessage: "We were unable to locate the account :(" }); 
        })
    } else {
        res.render('error', { errorMessage: `You need to specify a ${res.body.type || 'target'}` });
    }
});


(async () => {
    await refreshJob.fn()
        .then(() => {
            server.listen(process.env.PORT || 80, async () => {
                console.log("Starting Server...");
                refreshJob.start();
                console.log(`Good job ! Your server is now running, please navigate to http://localhost:80/ in a web browser.`);
            });
        })
})();