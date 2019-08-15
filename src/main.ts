import * as core from '@actions/core';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

function generateJWT(json: any) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: json.client_email,
    scope: 'https://www.googleapis.com/auth/chromewebstore',
    aud: 'https://www.googleapis.com/oauth2/v4/token',
    iat: issuedAt,
    exp: issuedAt + 3600
  };
  return jwt.sign(payload, json.private_key, {
    algorithm: 'RS256',
    keyid: json.private_key_id
  });
}

async function requestToken(jwt: string) {
  const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
    grant_type: encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer'),
    assertion: jwt
  });
  return response.data.access_token;
}

async function createAddon(zip: string, token: string) {
  const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items`;
  const body = fs.readFileSync(path.resolve(zip));
  const response = await axios.post(endpoint, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-api-version': '2'
    }
  });
  core.debug(`Response: ${JSON.stringify(response.data)}`);
}

async function updateAddon(id: string, zip: string, token: string) {
  const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${id}`;
  const body = fs.readFileSync(path.resolve(zip));
  const response = await axios.put(endpoint, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-api-version': '2'
    }
  });
  core.debug(`Response: ${JSON.stringify(response.data)}`);
}

async function run() {
  try {
    const service = core.getInput('service', { required: true });
    const extension = core.getInput('extension');
    const zip = core.getInput('zip', { required: true });

    const json = JSON.parse(service);
    const jwt = generateJWT(json);
    const token = await requestToken(jwt);

    if (extension && extension.length > 0) {
      await updateAddon(extension, zip, token);
    } else {
      await createAddon(zip, token);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
