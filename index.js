import express from 'express';
import mongoose from 'mongoose';
import accountRoutes from './routes/account.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/account', accountRoutes);

app.listen(process.env.PORT, async () => {
  try {
    mongoose.connect(`${process.env.STRINGCONEXION}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao Mongo DB com sucesso');
  } catch (error) {
    console.error('Não foi possivel conectar ao DB.');
  }
  console.info(`Server listen on port 3000`);
});
