const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');


const stuffCtrl = require ('../controllers/sauces');



//router.get('/', auth, stuffCtrl.getAllStuff);
router.post('/', auth,multer, stuffCtrl.createSauce);
router.post('/:id/like', auth,multer, stuffCtrl.likeSauce);
router.get('/:id', auth, stuffCtrl.getOneSauce);
router.put('/:id', auth, multer, stuffCtrl.modifySauce);
router.delete('/:id', auth, stuffCtrl.deleteSauce);
router.get('/', stuffCtrl.getAllSauces );

  module.exports = router;
