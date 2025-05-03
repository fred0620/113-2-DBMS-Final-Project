const express = require('express');
const cors = require('cors');
const app = express();


require('./config/db');


app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const sopsRouter = require('./routes/sops');
const userRouter = require('./routes/user');
app.use('/api/sops', sopsRouter);
app.use('/api/users', userRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





