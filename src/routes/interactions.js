const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { summarizeProgressText } = require('../aiService');

// Create interaction and compute aiSummary
router.post('/', async (req, res) => {
  const { clientId, dateTime, contactType, serviceType, durationMins, progressSummary, landlordId, actor } = req.body;
  const aiSummary = await summarizeProgressText(progressSummary || '');
  const interaction = await prisma.interaction.create({ data: { clientId, dateTime: dateTime ? new Date(dateTime) : new Date(), contactType, actor: actor || 'NAVIGATOR', landlordId: landlordId || null, serviceType: Array.isArray(serviceType) ? serviceType.join(',') : serviceType, durationMins, progressSummary, aiSummary } });
  // broadcast live update via WebSocket
  try {
    const { broadcast } = require('../wsServer');
    broadcast({ type: 'interaction_created', payload: { id: interaction.id, clientId: interaction.clientId, dateTime: interaction.dateTime } });
  } catch (e) { /* ignore */ }
  res.json(interaction);
});

// List interactions for a client
router.get('/client/:clientId', async (req, res) => {
  const clientId = Number(req.params.clientId);
  const items = await prisma.interaction.findMany({ where: { clientId }, orderBy: { dateTime: 'desc' } });
  res.json(items);
});

module.exports = router;
