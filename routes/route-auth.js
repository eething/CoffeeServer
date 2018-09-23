
const express = require( 'express' );

const router = express.Router();

router.get( '/', ( req, res ) => {
	res.send( 'AUTH' );
} );

router.get( '/login', ( req, res ) => {
	res.send( 'ID: *** <br>PASSWORD: ***<br>' );
} );

router.get( '/logout', ( req, res ) => {
	res.send( 'Logout... Redirect to ...' );
} );

module.exports = router;
