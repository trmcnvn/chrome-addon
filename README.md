# Chrome Addon Action

This action will publish your addon to the Chrome Web Store.

## Usage

See [action.yml](action.yml)

```yaml
steps:
  - uses: trmcnvn/chrome-addon@master
    with:
      # extension is only necessary when updating an existing addon,
      # omitting it will create a new addon
      extension: abcdefg
      zip: build/my-addon.zip
      client-id: ${{ secrets.CHROME_CLIENT_ID }}
      refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

## Google Credentials

For information on how to retreive these credentials check out this guide [here](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md)

## Troublehooting

In case your action returns an HTTP 400 error code from Chrome web store, make sure all needed information are filled in your developer dashboard *(privacy etc.)*

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
