import * as core from '@actions/core';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

function generateJWT(publisher: string, json: any) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: json.client_email,
    sub: publisher,
    scope: 'https://www.googleapis.com/auth/chromewebstore',
    aud: 'https://www.googleapis.com/oauth2/v4/token',
    iat: issuedAt,
    exp: issuedAt + 60
  };
  core.debug(`JWT Payload: ${payload}`);
  return jwt.sign(payload, json.private_key, {
    algorithm: 'RS256'
  });
}

async function requestToken(jwt: string) {
  const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
    grant_type: encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer'),
    assertion: jwt
  });
  return response.data.access_token;
}

async function createAddon(publisher: string, zip: string, token: string) {
  const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items?uploadType=media&publisherEmail=${publisher}`;
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
  const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${id}?uploadType=media`;
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
    const publisher = core.getInput('publisher', { required: true });
    const zip = core.getInput('zip', { required: true });
    const extension = core.getInput('extension');

    const json = JSON.parse(service);
    const jwt = generateJWT(publisher, json);
    const token = await requestToken(jwt);
    core.debug(`Token: ${token}`);

    if (extension && extension.length > 0) {
      await updateAddon(extension, zip, token);
    } else {
      await createAddon(publisher, zip, token);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
