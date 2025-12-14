const express = require('express');
const router = express.Router();
const { checkOverdueClientsAndNotify } = require('../scheduler');
const { getLastEmailResult } = require('../emailService');
const { renderTemplate } = require('../adminTemplates');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// POST /admin/run-overdue  -> triggers the overdue checker immediately
router.post('/run-overdue', requireAuth, requireAdmin, async (req, res) => {
  try {
    await checkOverdueClientsAndNotify();
    res.json({ status: 'ok', message: 'Overdue check triggered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /admin/last-email -> return last email result (dev/test helper)
router.get('/last-email', requireAuth, requireAdmin, (req, res) => {
  try{
    const last = getLastEmailResult();
    res.json({ last });
  }catch(err){ res.status(500).json({ error: err.message }) }
});

// POST /admin/preview-email
// body: { templateHtml?, templateName?, clientName, clientId, htmlFallback }
router.post('/preview-email', async (req, res) => {
  try{
    const { templateHtml, templateName, clientName, clientId, htmlFallback, navigatorName } = req.body;
    const html = await renderTemplate(templateHtml || templateName || 'default', { clientName, clientId, html: htmlFallback || '', navigatorName });
    res.json({ html });
  }catch(err){ res.status(500).json({ error: err.message }) }
});

module.exports = router;
