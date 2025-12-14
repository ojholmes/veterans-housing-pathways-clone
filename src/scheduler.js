const cron = require('node-cron');
const prisma = require('./prismaClient');
const { sendNavigatorAlert } = require('./emailService');
require('dotenv').config();

async function checkOverdueClientsAndNotify() {
  console.log('Running overdue clients check...');
  // For each client, fetch only the most recent interaction (efficient) and decide if overdue
  const clients = await prisma.client.findMany({
    include: {
      assignedNavigator: true,
      interactions: { orderBy: { dateTime: 'desc' }, take: 1 }
    }
  });
  const now = Date.now();
  const overdue = [];
  for (const c of clients) {
    const last = c.interactions && c.interactions.length ? c.interactions[0] : null;
    const daysSince = last ? (now - new Date(last.dateTime).getTime()) / (1000*60*60*24) : Infinity;
    if (daysSince > 14 && c.assignedNavigator && c.assignedNavigator.email) {
      overdue.push({ client: c, navigator: c.assignedNavigator, lastContact: last ? last.dateTime : null });
    }
  }

  for (const entry of overdue) {
    try {
      await sendNavigatorAlert({ to: entry.navigator.email, clientName: entry.client.fullName, clientId: entry.client.id });
      console.log(`Alert sent to ${entry.navigator.email} for client ${entry.client.fullName}`);
    } catch (err) {
      console.error('Failed sending alert', err);
    }
  }
}

function scheduleDaily() {
  const at = process.env.CHECK_OVERDUE_DAILY_AT || '02:00';
  // Convert HH:MM into cron expression: minute hour * * *
  const [hour, minute] = at.split(':').map(s => s.trim());
  const cronExpr = `${minute || '0'} ${hour || '2'} * * *`;
  console.log('Scheduling daily overdue check at', at, 'cron:', cronExpr);
  cron.schedule(cronExpr, () => {
    checkOverdueClientsAndNotify().catch(err => console.error(err));
  });
}

module.exports = { scheduleDaily, checkOverdueClientsAndNotify };
