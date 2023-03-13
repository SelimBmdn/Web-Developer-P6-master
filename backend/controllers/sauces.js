const Sauce = require('../models/Sauce_model');

const fs = require('fs');
const User = require('../models/User');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    delete sauceObject._userId
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };


    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }))
};


exports.likeSauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
        .then((sauces) => {
            console.log("--->CONTENU resultat promise : sauces");
            console.log(sauces);

// ----------like = 1 (likes +1)
            if (!sauces.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                console.log("les instructions seront éxecuté")

                User.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "User like +1" }))
                    .catch(error => res.status(400).json({ error }));
            };
            

//---------------like =0 (likes = 0, pas de vote)
            if (sauces.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                console.log("userId est dans userliked ET like =0")

                User.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "User like 0" }))
                    .catch(error => res.status(400).json({ error }));

            }

//----------- like = -1 (dislikes = +1)

            if (!sauces.usersLiked.includes(req.body.userId) && req.body.like === -1) {
                console.log("userId est dans userDisliked ET dislikes = 0")

                User.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "User dislike +1" }))
                    .catch(error => res.status(400).json({ error }));

            }

            // aprés un like = -1 on met un like = 0 (likes = 0 , pas des votes, on enleve le dislikes)
            if (sauces.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                console.log("userId est dans userDisliked ET like =0")

                User.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "User like 0" }))
                    .catch(error => res.status(400).json({ error }));

            }
        })
        .catch(error => res.status(400).json({ error }));

};