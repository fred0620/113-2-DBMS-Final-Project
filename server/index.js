const express = require('express');
const app = express();
const cors = require('cors');
const sopsRouter = require('./routes/sops');
const userRouter = require('./routes/user');

require('./config/db');


app.use(cors());
app.use('/api/sops', sopsRouter);
app.use('/api/users', userRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





