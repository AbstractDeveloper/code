const {google} = require('googleapis');
const fs = require('fs');
const {OAuth2Client} = require('google-auth-library');
const express = require('express');
const app = express();
const server = app.listen(3000, () => console.log('Server listening on port 3000 - http://localhost:3000/auth'));
const CLIENT_ID = '20076057053-2tfq109fqk32vd3d5d6gsigr58fq1fig.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauthcallback';
const SCOPES = ['https://www.googleapis.com/auth/fitness.activity.read', 'https://www.googleapis.com/auth/fitness.location.read', 'https://www.googleapis.com/auth/fitness.body.read','https://www.googleapis.com/auth/fitness.nutrition.read','https://www.googleapis.com/auth/fitness.blood_pressure.read', 'https://www.googleapis.com/auth/fitness.blood_glucose.read','https://www.googleapis.com/auth/fitness.oxygen_saturation.read','https://www.googleapis.com/auth/fitness.body_temperature.read','https://www.googleapis.com/auth/fitness.reproductive_health.read', 'https://www.googleapis.com/auth/fitness.heart_rate.read', 'https://www.googleapis.com/auth/fitness.sleep.read'];
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
function getAuthorizationUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return authUrl;
}
async function handleCallback(code) {
  try {
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
}
app.get('/auth', (req, res) => {
  const authUrl = getAuthorizationUrl();
  res.redirect(authUrl);
});
app.get('/oauthcallback', async (req, res) => {
  const code = req.query.code;
  await handleCallback(code);
  res.send('Authorization complete.');
  
  const fitness = google.fitness('v1');
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));
    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.calories.expended',
          dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
        }],
        bucketByTime: {
          durationMillis: 86400000
        },
        startTimeMillis: tenDaysAgo.getTime(),
        endTimeMillis: now.getTime()
      },
      auth: oauth2Client,
    });

    const intVals = [];

    // Specific Data
    for (const bucket of response.data.bucket) {
      try{
        intVals.push(bucket.dataset[0].point[0].value[0].fpVal);
      }
      catch
      {
        intVals.push(0);
      }
    }
    const jsonString = JSON.stringify(intVals[0]);
    const calculatedResults = jsonString;
    fs.writeFile('../LoginPage/pages/result.txt', calculatedResults, function (err) {if (err) throw err;});
    // server.close(() => {});
});
