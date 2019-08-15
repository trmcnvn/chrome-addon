# Chrome Addon Action

This action will publish your addon to the Chrome Web Store.

## Usage

See [action.yml](action.yml)

```yaml
steps:
  - uses: trmcnvn/chrome-addon@v1
    with:
      # extension is only necessary when updating an existing addon,
      # omitting it will create a new addon
      extension: abcdefg
      zip: build/my-addon.zip
      client-id: ${{ secrets.CHROME_CLIENT_ID }}
      client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
      refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
