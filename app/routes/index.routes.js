const express = require('express');

const UserRoutes = require('./UserRoutes');
const TipoDeAnaliseRoutes = require('./TipoDeAnaliseRoutes');
const ParametrosDeAnaliseRoutes = require('./ParametrosDeAnaliseRoutes');
const AmostraRoutes = require('./AmostraRoutes');
const ConfiguracaoDeAnaliseRoutes = require('./ConfiguracaoDeAnaliseRoutes');
const MateriaPrimaRoutes = require('./MateriaPrimaRoutes');
const OrdemDeServicoRoutes = require('./OrdemDeServicoRoutes');
const AuthRoutes = require('./AuthRoutes');
const AnalyticalDataRoutes = require('./AnalyticalDataRoutes');

const router = express.Router();

router.use('/users', UserRoutes);
router.use('/analise', TipoDeAnaliseRoutes);
router.use('/parametros', ParametrosDeAnaliseRoutes);
router.use('/amostras', AmostraRoutes);
router.use('/configuracaoanalises', ConfiguracaoDeAnaliseRoutes);
router.use('/materiaprima', MateriaPrimaRoutes);
router.use('/ordemdeservico', OrdemDeServicoRoutes);
router.use('/api', AuthRoutes);
router.use('/analytics', AnalyticalDataRoutes);

module.exports = router;
