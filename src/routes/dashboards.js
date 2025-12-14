const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Navigator Performance: active clients per navigator, interactions in last N days, avg days since last contact
router.get('/navigator-performance', async (req, res) => {
  const days = Number(req.query.days || 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const navigators = await prisma.navigator.findMany();

  const results = await Promise.all(navigators.map(async nav => {
    const activeClients = await prisma.client.count({ where: { assignedNavigatorId: nav.id, status: 'ACTIVE' } });
    const interactionsCount = await prisma.interaction.count({ where: { AND: [{ dateTime: { gte: since } }, { client: { assignedNavigatorId: nav.id } }] } });

    // compute avg days since last contact for clients assigned to this navigator
    const clients = await prisma.client.findMany({ where: { assignedNavigatorId: nav.id }, include: { interactions: { orderBy: { dateTime: 'desc' }, take: 1 } } });
    const daysSince = clients.length ? clients.reduce((acc, c) => {
      const last = c.interactions[0]?.dateTime ? new Date(c.interactions[0].dateTime) : null;
      const d = last ? (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24) : null;
      return acc + (d || 14); // if no contact, treat as 14+ default
    }, 0) / clients.length : null;

    return { navigator: { id: nav.id, fullName: nav.fullName, email: nav.email }, activeClients, interactionsCount, avgDaysSinceLastContact: daysSince };
  }));

  res.json(results);
});

// Landlord Performance: placeholder metrics. Requires linking interactions to landlords for full data.
router.get('/landlord-performance', async (req, res) => {
  const landlords = await prisma.landlord.findMany();
  const results = await Promise.all(landlords.map(async l => {
    // placements count
    const placementsList = await prisma.placement.findMany({ where: { landlordId: l.id } });
    const placements = placementsList.length;

    // average lease duration in months
    const leaseDurations = placementsList.filter(p => p.leaseEnd).map(p => {
      const start = new Date(p.leaseStart).getTime();
      const end = new Date(p.leaseEnd).getTime();
      return (end - start) / (1000 * 60 * 60 * 24 * 30);
    });
    const avgLeaseDurationMonths = leaseDurations.length ? (leaseDurations.reduce((a,b) => a+b,0) / leaseDurations.length) : null;

    // responsiveness: compute avg response time (hours) where a landlord interaction follows a non-landlord interaction for the same client
    const landlordInteractions = await prisma.interaction.findMany({ where: { landlordId: l.id, actor: 'LANDLORD' }, orderBy: { dateTime: 'asc' } });
    const responseTimesHours = [];
    for (const li of landlordInteractions) {
      // find the most recent non-landlord interaction for same client before this landlord interaction
      const prior = await prisma.interaction.findFirst({ where: { clientId: li.clientId, dateTime: { lt: li.dateTime }, NOT: { actor: 'LANDLORD' } }, orderBy: { dateTime: 'desc' } });
      if (prior) {
        const diffMs = new Date(li.dateTime).getTime() - new Date(prior.dateTime).getTime();
        responseTimesHours.push(diffMs / (1000 * 60 * 60));
      }
    }
    const avgResponseHours = responseTimesHours.length ? (responseTimesHours.reduce((a,b)=>a+b,0)/responseTimesHours.length) : null;
    // map avgResponseHours to a friendliness score 0-100 (lower hours => higher score)
    let responsivenessScore = null;
    if (avgResponseHours !== null) {
      const capped = Math.min(avgResponseHours, 72); // cap at 72 hours
      responsivenessScore = Math.round(100 - (capped / 72) * 100);
    }

    return { landlord: l, placements, avgLeaseDurationMonths, avgResponseHours, responsivenessScore };
  }));
  res.json(results);
});

module.exports = router;
