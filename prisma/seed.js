const prisma = require('../src/prismaClient');

async function main(){
  console.log('Seeding database...');
  await prisma.placement.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.client.deleteMany();
  await prisma.landlord.deleteMany();
  await prisma.navigator.deleteMany();

  const nav1 = await prisma.navigator.create({ data: { fullName: 'Ava Carter', email: 'ava.carter@example.org', phone: '555-0101' } });
  const nav2 = await prisma.navigator.create({ data: { fullName: 'Marcus Lee', email: 'marcus.lee@example.org', phone: '555-0202' } });

  const landlord1 = await prisma.landlord.create({ data: { propertyName: 'Harbor View Apartments', contactPerson: 'Sarah Kim', phone: '555-1001', acceptsVouchers: true } });
  const landlord2 = await prisma.landlord.create({ data: { propertyName: 'Elm Street Housing', contactPerson: 'Carlos Ruiz', phone: '555-1002', acceptsVouchers: false } });
  const landlord3 = await prisma.landlord.create({ data: { propertyName: 'Maple Gardens', contactPerson: 'Helen Park', phone: '555-1003', acceptsVouchers: true } });

  const clients = [];
  clients.push(await prisma.client.create({ data: { fullName: 'John Veteran', status: 'ACTIVE', housingSituation: 'Unsheltered', phone: '555-2001', email: 'john.v@example.org', assignedNavigatorId: nav1.id } }));
  clients.push(await prisma.client.create({ data: { fullName: 'Robert Smith', status: 'WAITLIST', housingSituation: 'Temporary Shelter', phone: '555-2002', email: 'robert.s@example.org', assignedNavigatorId: nav1.id } }));
  clients.push(await prisma.client.create({ data: { fullName: 'Linda Perez', status: 'ACTIVE', housingSituation: 'Couch Surfing', phone: '555-2003', email: 'linda.p@example.org', assignedNavigatorId: nav2.id } }));
  clients.push(await prisma.client.create({ data: { fullName: 'Michael Brown', status: 'HOUSED', housingSituation: 'Permanent', phone: '555-2004', email: 'michael.b@example.org', assignedNavigatorId: nav2.id } }));
  clients.push(await prisma.client.create({ data: { fullName: 'Sofia Gomez', status: 'ACTIVE', housingSituation: 'Rent Arrears', phone: '555-2005', email: 'sofia.g@example.org', assignedNavigatorId: nav1.id } }));
  clients.push(await prisma.client.create({ data: { fullName: 'Tom Nguyen', status: 'WAITLIST', housingSituation: 'Unsheltered', phone: '555-2006', email: 'tom.n@example.org', assignedNavigatorId: nav2.id } }));

  // Create interactions: some recent, some overdue (>14 days)
  const now = Date.now();
  // John: recent contact 2 days ago
  await prisma.interaction.create({ data: { clientId: clients[0].id, dateTime: new Date(now - 2*24*60*60*1000), contactType: 'phone', actor: 'NAVIGATOR', serviceType: 'case_management', durationMins: 20, progressSummary: 'Checked in; scheduled ID retrieval.' } });
  // Robert: last contact 20 days ago -> overdue
  await prisma.interaction.create({ data: { clientId: clients[1].id, dateTime: new Date(now - 20*24*60*60*1000), contactType: 'in_person', actor: 'NAVIGATOR', serviceType: 'intake', durationMins: 45, progressSummary: 'Initial intake completed.' } });
  // Linda: last contact 35 days ago -> overdue
  await prisma.interaction.create({ data: { clientId: clients[2].id, dateTime: new Date(now - 35*24*60*60*1000), contactType: 'email', actor: 'NAVIGATOR', serviceType: 'referral', durationMins: 5, progressSummary: 'Referred to housing program; awaiting documents.' } });
  // Michael: recent placement and landlord interactions
  await prisma.interaction.create({ data: { clientId: clients[3].id, dateTime: new Date(now - 60*24*60*60*1000), contactType: 'email', actor: 'NAVIGATOR', serviceType: 'placement', durationMins: 10, progressSummary: 'Placement initiated with Harbor View', landlordId: landlord1.id } });
  await prisma.interaction.create({ data: { clientId: clients[3].id, dateTime: new Date(now - 59*24*60*60*1000), contactType: 'email', actor: 'LANDLORD', serviceType: 'placement_response', durationMins: 10, progressSummary: 'Landlord confirmed lease and move-in', landlordId: landlord1.id } });

  // Sofia: had landlord interaction recently
  await prisma.interaction.create({ data: { clientId: clients[4].id, dateTime: new Date(now - 5*24*60*60*1000), contactType: 'phone', actor: 'NAVIGATOR', serviceType: 'application_support', durationMins: 25, progressSummary: 'Applied for unit at Maple Gardens', landlordId: landlord3.id } });
  await prisma.interaction.create({ data: { clientId: clients[4].id, dateTime: new Date(now - 3*24*60*60*1000), contactType: 'email', actor: 'LANDLORD', serviceType: 'application_response', durationMins: 5, progressSummary: 'Requested additional documents', landlordId: landlord3.id } });

  // Create placements for Michael
  await prisma.placement.create({ data: { clientId: clients[3].id, landlordId: landlord1.id, leaseStart: new Date(now - 59*24*60*60*1000), leaseEnd: new Date(now + 365*24*60*60*1000) } });

  // Seed some templates
  await prisma.template.create({ data: { name: 'default', subject: 'Notification for {{clientName}}', html: '<p>Dear {{clientName}},</p><p>This is an alert regarding client <strong>{{clientName}}</strong> (ID: {{clientId}}).</p><p>{{html}}</p>' } });
  await prisma.template.create({ data: { name: 'overdue_alert', subject: 'Overdue contact alert for {{clientName}}', html: '<p>Hi {{navigatorName}},</p><p>Client <strong>{{clientName}}</strong> (ID: {{clientId}}) has not been contacted in 14+ days.</p><p>Please reach out: {{html}}</p>' } });

  console.log('Seeding complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
