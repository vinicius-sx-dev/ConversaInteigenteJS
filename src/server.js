require('dotenv').config(); 

const app = require('./app');

const PORT = process.env.PORT || 3001;

const endereco = `http://localhost:${PORT}`

app.listen(PORT, () => {
  console.log(`SERVIDOR RODANDO EM ${endereco}`);
});
