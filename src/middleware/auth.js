const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(payload, opts = {}){
  return jwt.sign(payload, JWT_SECRET, Object.assign({ expiresIn: '8h' }, opts));
}

async function requireAuth(req, res, next){
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice('Bearer '.length);
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    // attach user (navigator) record if available
    if (decoded && decoded.sub){
      const nav = await prisma.navigator.findUnique({ where: { id: Number(decoded.sub) } });
      req.user = { ...decoded, navigator: nav };
    } else {
      req.user = decoded;
    }
    return next();
  }catch(err){
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireAdmin(req, res, next){
  if (!req.user) return res.status(401).json({ error: 'not authenticated' });
  const roles = req.user.roles || [];
  if (Array.isArray(roles) && roles.includes('admin')) return next();
  return res.status(403).json({ error: 'requires admin' });
}

module.exports = { signToken, requireAuth, requireAdmin };
