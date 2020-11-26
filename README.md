# etherscan-to-csv
Extract Etherscan indexed data to csv format

## Get started 
Install
```
yarn install
```

Copy `.env.example` into `.env` and put in your Etherscan API key

You're ready to go!

### Example commands
Run an extract for a token with address `0x45804880De22913dAFE09f4980848ECE6EcbAf78` starting at block `11300000` and endingn at block `11331000`
```
yarn extract 0x45804880De22913dAFE09f4980848ECE6EcbAf78 11300000 11331000
```

## Todos
- [ ] Add test coverage
- [ ] Add ability to export to json
- [ ] Account for API throttling when not using an API key
- [ ] Make querying logic more intelligent or more flexible to support higher tx throughput tokens
- [ ] Support queries other than just token tx history
