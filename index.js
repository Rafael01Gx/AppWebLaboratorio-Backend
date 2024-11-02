
const express = require("express");
const cors = require("cors");
const { port } = require('./config');
const app = express()

// RoutesImports
const UserRoutes = require('./routes/UserRoutes');
const TipoDeAnaliseRoutes = require('./routes/TipoDeAnaliseRoutes');
const ParametrosDeAnaliseRoutes = require('./routes/ParametrosDeAnaliseRoutes');
const AmostraRoutes = require('./routes/AmostraRoutes');
const ConfiguracaoDeAnaliseRoutes = require('./routes/ConfiguracaoDeAnaliseRoutes');
const MateriaPrimaRoutes = require('./routes/MateriaPrimaRoutes');
const OrdemDeServicoRoutes = require('./routes/OrdemDeServicoRoutes');
const AuthRoutes = require('./routes/AuthRoutes');



// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin:['http://localhost:4200','http://192.168.1.13:4200']}))

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