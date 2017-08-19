# Pts

![image](./guide/assets/pts.png)
Pts is a new typescript/es6 library that enables you to compose and visualize points in spaces.

This project is currently still in development. Almost there!

Take a peek at [ptsjs.org](https://ptsjs.org)


## Usage
```
npm install pts
```

Alternatively, download the latest release and link `pts.min.js` in your html.
```
<script type="text/javascript" src="./pts.min.js"></script>
```



## For development

### Build and test
```
npm start
npm run build
npm test
```

### Generate docs
```
typedoc --readme none --out docs src --name Pts
```

### Generate typescript declaration files
```
tsc
dts-bundle --name pts --main dist/files/*.d.ts --out ../pts.d.ts
```

### License
Apache License 2.0. 