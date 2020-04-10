import * as core from '@actions/core';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function requestToken(id: string, secret: string, refresh: string) {
  const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
    client_id: id,
    client_secret: secret,
    refresh_token: refresh,
    grant_type: 'refresh_token'
  });
  return response.data.access_token;
}

async function createAddon(zip: string, token: string) {
  const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items?uploadType=media`;
  const body = fs.readFileSync(path.resolve(zip));
  const response = await axios.post(endpoint, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-api-version': '2'
    },
    maxContentLength: Infinity
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
    },
    maxContentLength: Infinity
  });
  core.debug(`Response: ${JSON.stringify(response.data)}`);
}

async function publishAddon(id: string, token: string, publishTarget: string) {
  const endpoint = `https://www.googleapis.com/chromewebstore/v1.1/items/${id}/publish`;
  const response = await axios.post(
    endpoint,
    { target: publishTarget },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-goog-api-version': '2'
      }
    }
  );
  core.debug(`Response: ${JSON.stringify(response.data)}`);
}

async function run() {
  try {
    const clientId = core.getInput('client-id', { required: true });
    const clientSecret = core.getInput('client-secret', { required: true });
    const refresh = core.getInput('refresh-token', { required: true });
    const zip = core.getInput('zip', { required: true });
    const extension = core.getInput('extension');
    const publishTarget = core.getInput('publish-target');

    const token = await requestToken(clientId, clientSecret, refresh);
    core.debug(`Token: ${token}`);

    if (extension && extension.length > 0) {
      await updateAddon(extension, zip, token);
      await publishAddon(extension, token, publishTarget);
    } else {
      await createAddon(zip, token);
      await publishAddon(extension, token, publishTarget);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
