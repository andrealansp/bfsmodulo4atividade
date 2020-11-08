import express from 'express';
import { newAccount } from '../modules/accountsModule.js';

const routes = express.Router();
routes.use(express.json());

// Rota para Depósito
routes.patch('/deposit', async (req, res, next) => {
  let { agencia, conta, deposit } = req.body;

  try {
    let account = await newAccount.find({ agencia: agencia, conta: conta });

    if (!account[0]) throw new Error('Conta não encontrada');

    const updatedAccount = {
      agencia: agencia,
      conta: conta,
      balance: account[0].balance + deposit,
    };
    account = await newAccount.findByIdAndUpdate(
      { _id: account[0]._id },
      updatedAccount,
      { new: true }
    );
    res.send(account);
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para saque
routes.patch('/withdrawal', async (req, res, next) => {
  let { agencia, conta, withdrawal } = req.body;

  try {
    let account = await newAccount.find({ agencia: agencia, conta: conta });

    if (!account[0]) throw new Error('Conta não encontrada');

    const updatedAccount = {
      agencia: agencia,
      conta: conta,
      balance: account[0].balance - withdrawal,
    };

    if (account[0].balance < 0 || updatedAccount.balance < 0) {
      throw new Error('Saldo Insuficiente!');
    }

    account = await newAccount.findByIdAndUpdate(
      { _id: account[0]._id },
      updatedAccount,
      { new: true }
    );

    res.send(account);
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para pegar o Saldo
routes.get('/balance', async (req, res, next) => {
  let { agencia, conta } = req.query;

  try {
    let account = await newAccount.find({ agencia: agencia, conta: conta });
    res.send({
      Message: `${account[0].name},  o saldo da conta ${account[0].conta} é: ${account[0].balance}`,
    });
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para exclusão
routes.delete('/del', async (req, res, next) => {
  let { agencia, conta } = req.query;
  try {
    let account = await newAccount.find({
      agencia: parseInt(agencia),
      conta: parseInt(conta),
    });
    if (!account[0]) throw new Error('Conta não encontrada');
    account = await newAccount.findByIdAndDelete({ _id: account[0].id });

    if (!account) {
      res.status(404).send({ message: 'Documento Não Encontrado' });
    } else {
      account = await newAccount.find({ agencia: agencia });
      let contas = account.length;
      res
        .status(200)
        .send({ contasAtivas: contas, message: 'Documento Deletado' });
    }
    res.send();
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para média de todas as contas
routes.get('/average', async (req, res, next) => {
  const { agencia } = req.query;
  try {
    const avgBalances = await newAccount.aggregate([
      { $match: { agencia: parseInt(agencia) } },
      { $group: { _id: null, average: { $avg: '$balance' } } },
    ]);
    res.send({ mediaBlances: avgBalances });
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para listar os menores saldos
routes.get('/smaller', async (req, res, next) => {
  const { limite } = req.query;
  try {
    const smaller = await newAccount
      .find({}, { _id: 0, name: 0 })
      .sort({ balance: 1 })
      .limit(parseInt(limite));
    res.send({ smaller });
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para transferência entre contas.
routes.post('/transfer', async (req, res, next) => {
  let { originAccount, DestinyAccount, deposit } = req.body;
  let json;

  try {
    let acOrigin = await newAccount.find({
      conta: originAccount,
    });
    let acDestiny = await newAccount.find({
      conta: DestinyAccount,
    });

    if (!acOrigin[0] && !acDestiny[0])
      throw new Error('Favor verificar conta de origen e destino');

    if (deposit > acOrigin.balance)
      throw new Error('Você não tem saldo suficiente');

    if (acOrigin[0].agencia != acDestiny[0].agencia) {
      let data;
      const updatedOrigin = {
        balance: acOrigin[0].balance - deposit - 8,
      };
      data = await newAccount.findByIdAndUpdate(
        { _id: acOrigin[0]._id },
        updatedOrigin
      );

      const updatedDestiny = {
        balance: acDestiny[0].balance + deposit,
      };
      data = await newAccount.findByIdAndUpdate(
        { _id: acDestiny[0]._id },
        updatedDestiny
      );
    } else {
      let data;
      const updatedOrigin = {
        balance: acOrigin[0].balance - deposit,
      };
      data = await newAccount.findByIdAndUpdate(
        { _id: acOrigin[0]._id },
        updatedOrigin
      );

      const updatedDestiny = {
        balance: acDestiny[0].balance + deposit,
      };
      data = await newAccount.findByIdAndUpdate(
        { _id: acDestiny[0]._id },
        updatedDestiny
      );
    }
    let account = await newAccount.find({ conta: originAccount });
    res.send(account);
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para maiores Saldos
routes.get('/rich', async (req, res, next) => {
  const { limite } = req.query;
  try {
    const rich = await newAccount
      .find({}, { _id: 0 })
      .sort({ balance: -1, name: 1 })
      .limit(parseInt(limite));
    res.send({ rich });
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

routes.get('/private', async (req, res, next) => {
  try {
    let gtRich = await newAccount
      .find({}, { _id: 1, agencia: 1, balance: 1 })
      .sort({ balance: -1 })
      .limit(4);

    gtRich.forEach(async (data) => {
      gtRich = await newAccount.findByIdAndUpdate(
        { _id: data._id },
        { agencia: 99 },
        { new: true }
      );
    });

    res.send({ gtRich });
  } catch (error) {
    res.status(500).send({ Error: error.message });
  }
});

//Rota para retornar todas as contas
routes.get('/', async (_, res, next) => {
  try {
    const data = await newAccount.find({});
    console.log(data);
    res.send(data);
  } catch (error) {
    console.log('Error' + error.message);
  }
});

export default routes;
