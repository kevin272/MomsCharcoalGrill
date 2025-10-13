// routes/cateringOptionRoutes.js
const express = require('express');
const router = express.Router();

const {
  list, getOne, create, update, remove, toggleActive
} = require('../controllers/CateringOptionController');

// If you already have a Multer wrapper (e.g., fileUpload.js):
const {upload} = require('../middlewares/fileUpload'); 
// Expecting something like: module.exports = multer({ storage }).single('image')
// If it's different, adapt to: upload.single('image')

router.get('/', list);
router.get('/:id', getOne);
router.post('/', upload.single('image'), create);
router.put('/:id', upload.single('image'), update);
router.delete('/:id', remove);
router.patch('/:id/toggle', toggleActive);

module.exports = router;
