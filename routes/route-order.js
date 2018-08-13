'use strict';
var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.send( 'What do you want to order?' );
} );

module.exports = router;
