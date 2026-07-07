# Bubble Map

Force Directed Mind Mapping Tree for rapid (Collaborative) idea generation

## Development setup

```sh
nvm use                 # Node 24 (see .nvmrc)
cp .env.example .env    # public Firebase web config (see comments in the file)
npm ci
npm start               # runs Vite + Firebase emulators
```

Tests run against the Firebase emulators (requires a JDK 21+): `npm run test`

## Contributing

Interesting in contributing? Check out the [GitHub repository](https://github.com/SpiritSeal/bubblemap) and read our [contributing instructions](https://github.com/SpiritSeal/bubblemap/blob/main/.github/CONTRIBUTING.md)
