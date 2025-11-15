const express = require('express');
const app = express();
app.get('/healthz', (_,res)=>res.send('ok'));
app.get('/readyz', (_,res)=>res.send('ready'));
app.listen(3000, ()=>console.log('BFF on :3000'));
