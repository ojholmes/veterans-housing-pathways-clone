const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { signToken } = require('../middleware/auth');

// POST /auth/login { email }
// NOTE: simple login for demo: issue token if navigator exists. In production add password flow.
router.post('/login', async (req, res) => {
  try{
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    const nav = await prisma.navigator.findUnique({ where: { email } });
    if (!nav) return res.status(401).json({ error: 'unknown user' });

    const adminList = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
    const roles = adminList.includes(email) ? ['navigator','admin'] : ['navigator'];

    const token = signToken({ sub: nav.id, email: nav.email, roles });
    res.json({ token, navigator: nav });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
