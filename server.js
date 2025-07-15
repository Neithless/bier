// server.js
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'jouw-gebruikersnaam';
const REPO_NAME = 'jouw-repo';
const FILE_PATH = 'biercollectie.json';
const BRANCH = 'main'; // of 'master' als dat je default branch is

app.post('/update', async (req, res) => {
  const nieuweData = JSON.stringify(req.body, null, 2);

  // 1. Haal de SHA van de huidige file op
  const getFileUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    const getResp = await fetch(getFileUrl, { headers });
    const getData = await getResp.json();

    const sha = getData.sha; // nodig voor update

    // 2. Update de file
    const updateBody = {
      message: 'Update biercollectie',
      content: Buffer.from(nieuweData).toString('base64'),
      sha: sha,
      branch: BRANCH
    };

    const updateResp = await fetch(getFileUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateBody)
    });

    const updateData = await updateResp.json();

    res.json({ success: true, response: updateData });
  } catch (err) {
    console.error('Fout bij GitHub API:', err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
