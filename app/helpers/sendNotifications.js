const User = require("../models/User");  
async function notificacaoNovaOs(ordemDeServico) {

  const notification = {
    title: "Nova Ordem de Serviço!",
    message: `Nº ${ordemDeServico.numeroOs} - criada por: ${ordemDeServico.solicitante.name}, ${ordemDeServico.solicitante.area}.`,
    data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
    read: false
  };

  try {
    const admins = await User.find({ level: "Administrador" });

    if (admins.length === 0) {
      console.log("Nenhum administrador encontrado.");
      return;
    }
    const updatePromises = admins.map(async (admin) => {
      admin.notifications.push(notification); 
      await admin.save();
    });

    await Promise.all(updatePromises);

  } catch (error) {
    console.error("Erro ao adicionar a notificação:", error);
  }
}
async function notificacaoConclusaoDeOS(ordemDeServico) {
  const id = ordemDeServico.solicitante._id
  const notification = {
    title: "Sua Ordem de Serviço foi Concluída!",
    message: `A Ordem de Serviço Nº ${ordemDeServico.numeroOs} foi concluída e já pode ser visualizada.`,
    data: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
    read: false
  };

  try {
    const user = await User.findById(id);
    if (!user) {
      console.log("Usuário solicitante não encontrado.")
      return;
    }

    user.notifications.push(notification);

    await User.findOneAndUpdate(
      { _id: user.id },
      { $push: { notifications: notification } }, 
      { new: true }
    );

    console.log("Notificação adicionada com sucesso!");

  } catch (error) {
    console.error("Erro ao adicionar a notificação:", error);
  }
}


module.exports = {notificacaoNovaOs, notificacaoConclusaoDeOS}