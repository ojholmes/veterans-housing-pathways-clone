const express = require('express');
const router = express.Router();
const { listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } = require('../adminTemplates');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /admin/templates
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const templates = await listTemplates();
    res.json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/templates/:id
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const t = await getTemplate(req.params.id);
    if (!t) return res.status(404).json({ error: 'not found' });
    res.json({ template: t });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/templates
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const created = await createTemplate(req.body);
    res.status(201).json({ template: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/templates/:id
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await updateTemplate(req.params.id, req.body);
    res.json({ template: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/templates/:id
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await deleteTemplate(req.params.id);
    res.json({ status: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
