
module.exports = ( req, res ) => {
	res.setHeader( 'Content-Type', 'application/json' );
	if ( !req.user ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You must login.',
		} ) );
		return true;
	}
	return false;
};
