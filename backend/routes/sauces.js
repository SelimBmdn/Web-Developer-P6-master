const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');


const stuffCtrl = require ('../controllers/sauces');


router.get('/', stuffCtrl.getAllThings );
//router.get('/', auth, stuffCtrl.getAllStuff);
router.post('/', auth,multer, stuffCtrl.createThing);
router.post('/:id/like', auth,multer, stuffCtrl.likeThing);
router.get('/:id', auth, stuffCtrl.getOneThing);
router.put('/:id', auth, multer, stuffCtrl.modifyThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);



  module.exports = router;
