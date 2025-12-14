const Handlebars = require('handlebars');
const prisma = require('./prismaClient');

// DB-backed template helper. renderTemplate accepts either raw HTML or a template `name` (string).
async function renderTemplate(templateNameOrHtml, data = {}){
  let tpl = templateNameOrHtml || null;

  // If caller passed a template name (no angle-brackets and not full HTML), try DB lookup
  if (tpl && typeof tpl === 'string' && !tpl.includes('<')){
    const t = await prisma.template.findUnique({ where: { name: tpl } });
    if (t) tpl = t.html;
  }

  // If still empty, fallback to DB 'default' template or hardcoded fallback
  if (!tpl){
    const t = await prisma.template.findUnique({ where: { name: 'default' } });
    tpl = (t && t.html) || '<p>Dear {{clientName}},</p><p>This is an alert regarding client <strong>{{clientName}}</strong> (ID: {{clientId}}).</p><p>{{html}}</p>';
  }

  const compiled = Handlebars.compile(tpl);
  return compiled(data);
}

async function listTemplates(){
  return prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getTemplate(id){
  return prisma.template.findUnique({ where: { id: Number(id) } });
}

async function createTemplate(payload){
  return prisma.template.create({ data: payload });
}

async function updateTemplate(id, payload){
  return prisma.template.update({ where: { id: Number(id) }, data: payload });
}

async function deleteTemplate(id){
  return prisma.template.delete({ where: { id: Number(id) } });
}

module.exports = { renderTemplate, listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate };
