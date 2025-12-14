const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Create client
router.post('/', async (req, res) => {
  const { fullName, status, housingSituation, phone, email, assignedNavigatorId } = req.body;
  const client = await prisma.client.create({ data: { fullName, status, housingSituation, phone, email, assignedNavigatorId } });
  res.json(client);
});

// Get client list with basic filters
router.get('/', async (req, res) => {
  const clients = await prisma.client.findMany({ include: { assignedNavigator: true } });
  res.json(clients);
});

// Get client by id (including interactions)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const client = await prisma.client.findUnique({ where: { id }, include: { interactions: true, assignedNavigator: true } });
  if (!client) return res.status(404).json({ error: 'Not found' });
  res.json(client);
});

// Mark contact done (creates a simple interaction record for the client)
router.post('/:id/contact', async (req, res) => {
  const id = Number(req.params.id);
  const { contactType = 'phone', serviceType = 'contact', durationMins = 5, progressSummary = 'Contacted via app', actor = 'NAVIGATOR', landlordId = null } = req.body;
  try {
    const interaction = await prisma.interaction.create({ data: { clientId: id, dateTime: new Date(), contactType, serviceType: Array.isArray(serviceType) ? serviceType.join(',') : serviceType, durationMins, progressSummary, actor, landlordId } });
    try { const { broadcast } = require('../wsServer'); broadcast({ type: 'interaction_created', payload: { id: interaction.id, clientId: interaction.clientId, dateTime: interaction.dateTime } }); } catch(e){}
    // also broadcast client update
    try { const { broadcast } = require('../wsServer'); broadcast({ type: 'client_updated', payload: { id } }); } catch(e){}
    res.json(interaction);
  } catch (err) {
    console.error('Failed to create contact interaction', err);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

module.exports = router;
