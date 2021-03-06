'use strict'
let path = require('path');
let fs = require('fs');
let mongoosePaginate = require('mongoose-pagination');

let Artist = require('../models/artist');
let Album = require('../models/album');
let Song = require('../models/song');


function getAlbum(req, res) {
    let albumId = req.params.id;
    Album.findById(albumId).populate({ path: 'artist' }).exec((err, album) => {
        if (err) {
            res.status(500)
                .status({ message: 'Error ern la peticion' });
        } else {
            if (!album) {
                res.status(404)
                    .send({ message: 'El album no existe' })
            } else {
                res.status(200)
                    .send({ album })
            }
        }
    });

}

function getAlbums(req, res) {
    let artistId = req.params.artist;
    let find
    if (!artistId) {
        //sacar los albums de la bbdd
        find = Album.find({}).sort('title');
    } else {
        //sacar los albums de un artista concreto de la bbdd
        find = Album.find({ artist: artistId }).sort('year');
    }
    find.populate({ path: 'artist' }).exec((err, albums) => {
        if (err) {
            res.status(500)
                .status({ message: 'Error en la peticion' });
        } else {
            if (!albums) {
                res.status(404)
                    .send({ message: 'No hay albums en la base de datos' })
            } else {
                res.status(200)
                    .send({ albums })
            }
        }
    });
}

function saveAlbum(req, res) {
    let album = new Album();
    let params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;
    album.save((err, albumStored) => {
        if (err) {
            res.status(500)
                .send({ message: 'Error en el servidor' });
        } else {
            if (!albumStored) {
                res.status(404)
                    .send({ message: 'No se ha guardado el album' });
            } else {
                res.status(200)
                    .send({ album: albumStored });
            }
        }
    });
}


function updateAlbum(req, res) {
    let albumId = req.params.id;
    let update = req.body;
    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if (err) {
            res.status(500)
                .send({ message: 'Error en el servidor' });
        } else {
            if (!albumUpdated) {
                res.status(404)
                    .send({ message: 'No se ha podido actualizar' });
            } else {
                res.status(200)
                    .send({ albumUpdated });
            }
        }

    });
}

function deleteAlbum(req, res) {
    let albumId = req.params.id;
    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if (err) {
            res.status(500)
                .send({ message: 'Error al eliminar los ambums' });
        } else {
            if (!albumRemoved) {
                res.status(404)
                    .send({ message: 'Los albums no se han podido eliminar' })
            } else {
                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        res.status(500)
                            .send({ message: 'Error al eliminar las canciones' });
                    } else {
                        if (!songRemoved) {
                            res.status(404)
                                .send({ message: 'Las canciones no se han podido eliminar' })
                        } else {
                            res.status(200)
                                .send({ album: albumRemoved });
                        }
                    }
                });
            }

        }
    });
}

function uploadImage(req, res){
    let albumId = req.params.id;
    let file_name = "No subido ...";
    if(req.files){
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        file_name = file_split[2];
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(!albumUpdated){
                    res.status(404)
                        .send({message: 'No se ha podido actualizar el artista'});
                }else{
                    res.status(200)
                        .send({album: albumUpdated});
                }
            });

        }else{
            res.status(404)
                .send({message: 'Extension no valida'});
        }
    }else{
        res.status(404)
            .send({message: 'No has subido ninguna iumagen'});
    }

}

function getImageFile(req, res){
    let imageFile = req.params.imageFile;
    let path_file = './uploads/album/'+ imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'No existe la imagen...'})
        }
    });
}

module.exports = {
    getAlbum,
    getAlbums,
    saveAlbum,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
};