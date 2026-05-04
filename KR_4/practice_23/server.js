const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || `server-${PORT}`; 

app.get('/', (req, res) => {
  res.json({
    server: SERVER_ID, 
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});