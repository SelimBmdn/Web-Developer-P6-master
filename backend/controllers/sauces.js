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
        .then((sauce) => {
            console.log("--->CONTENU resultat promise : sauces");

            let usersLiked = sauce.usersLiked
            let usersDisliked = sauce.usersDisliked
            const userId = req.body.userId

            switch (req.body.like) {
                case 1:
                    if (!usersLiked.includes(userId)) {
                        usersLiked.push(userId)
                    }
                    if (usersDisliked.includes(userId)) {
                        usersDisliked.remove(userId)
                    }
                    break
                case 0:
                    if (usersLiked.includes(userId)) {
                        usersLiked.remove(userId)
                    }
                    if (usersDisliked.includes(userId)) {
                        usersDisliked.remove(userId)
                    }
                    break
                case -1:
                    if (usersLiked.includes(userId)) {
                        usersLiked.remove(userId)
                    }
                    if (!usersDisliked.includes(userId)) {
                        usersDisliked.push(userId)
                    }
                    break
                default:
                    return res.status(400).json({ error: "Bad request" })

            }

            // tableaux a jours 
            console.log(usersDisliked, usersLiked, req.params.id)
            Sauce.updateOne(
                { _id: req.params.id },
                {
                    usersLiked: usersLiked,
                    usersDisliked: usersDisliked,
                    likes: usersLiked.length,
                    dislikes: usersDisliked.length,
                }
            )
                .then(() => res.status(201).json({ message: "User MAJ" }))
                .catch(error => res.status(400).json({ error }))

        })
        .catch(error => res.status(400).json({ error }));

};