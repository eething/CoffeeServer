'use strict';
var express = require( 'express' );
var router = express.Router();

router.get( '/', function (req, res) {
    res.send( 'AUTH' );
} );

router.get( '/login', function (req, res) {
    res.send( 'ID: *** <br>PASSWORD: ***<br>' );
} );

router.get( '/logout', function (req, res) {
    res.send( 'Logout... Redirect to ...' );
} );

module.exports = router;
