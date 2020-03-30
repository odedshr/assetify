# Assetomat
Use Chokidar to watch multiple sources and copy to multiple targets

## Installing
```
npm i -D assetomat
```

## Setting up
Add an `assets` section to your `package.json` with an array of element; 
Each element should have `source` and `target - that can be either single item or an array of items
```
  "assets": [
    {
      "source": [
        "inputs/dir1",
        "inputs/dir2"
      ],
      "target": "outputs/out1"
    },
    {
      "source": "inputs/dir3",
      "target": [
        "outputs/out1",
        "outputs/out2"
      ]
    }
  ]
  ```
  
## Running
```
node ./node_modules/assetify/index.js
```

You can also run it just once by adding a "once" argument
  ```
  node ./node_modules/assetify/index.js once
  ```