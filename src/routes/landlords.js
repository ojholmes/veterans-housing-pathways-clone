const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.post('/', async (req, res) => {
  const { propertyName, contactPerson, phone, acceptsVouchers } = req.body;
  const landlord = await prisma.landlord.create({ data: { propertyName, contactPerson, phone, acceptsVouchers } });
  res.json(landlord);
});

router.get('/', async (req, res) => {
  const list = await prisma.landlord.findMany();
  res.json(list);
});

module.exports = router;
