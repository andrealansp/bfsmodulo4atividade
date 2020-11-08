import express from 'express';
import { studentRouter } from './routes/studentRouter.js';
import mongoose from 'mongoose';

(async () => {
  try {
    mongoose.connect(
      'mongodb+srv://andrealves:S@lmos2300@andrealves.ykvuo.mongodb.net/grades?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Conectado ao Mongo DB com sucesso');
  } catch (error) {
    console.error('Não foi possivel conectar ao DB.');
  }
})();

const app = express();

app.use(express.json());
app.use('/student', studentRouter);

app.listen(3000, () => console.log('App Iniciada'));
