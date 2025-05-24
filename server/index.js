const express = require('express');
const cors = require('cors');
const app = express();


require('./config/db');


app.use(cors());
app.use(express.json()); 


const sopsRouter = require('./routes/sops');
const userRouter = require('./routes/users');
const reportRouter = require('./routes/report');
app.use('/api/sops', sopsRouter);
app.use('/api/users', userRouter);
app.use('/api/report', reportRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





