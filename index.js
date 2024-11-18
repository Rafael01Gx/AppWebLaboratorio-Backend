
const express = require("express");
const cors = require("cors");
const { port } = require('./config');
const app = express()

// RoutesImports
const UserRoutes = require('./app/routes/UserRoutes');
const TipoDeAnaliseRoutes = require('./app/routes/TipoDeAnaliseRoutes');
const ParametrosDeAnaliseRoutes = require('./app/routes/ParametrosDeAnaliseRoutes');
const AmostraRoutes = require('./app/routes/AmostraRoutes');
const ConfiguracaoDeAnaliseRoutes = require('./app/routes/ConfiguracaoDeAnaliseRoutes');
const MateriaPrimaRoutes = require('./app/routes/MateriaPrimaRoutes');
const OrdemDeServicoRoutes = require('./app/routes/OrdemDeServicoRoutes');
const AuthRoutes = require('./app/routes/AuthRoutes');



// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin:['http://localhost:4200','http://192.168.1.164:4200']}))

// Public folder for images
app.use(express.static('public')) 

// Routes
app.use('/users',UserRoutes)
app.use('/analise',TipoDeAnaliseRoutes)
app.use('/parametros',ParametrosDeAnaliseRoutes)
app.use('/amostras',AmostraRoutes)
app.use('/configuracaoanalises',ConfiguracaoDeAnaliseRoutes)
app.use('/materiaprima',MateriaPrimaRoutes)
app.use('/ordemdeservico',OrdemDeServicoRoutes)
app.use('/api',AuthRoutes)



app.listen(port,()=>console.log("App run on port: ", port))