
module.exports = ( req, res, check ) => {
	res.setHeader( 'Content-Type', 'application/json' );
	if ( !req.user ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You must login.',
		} ) );
		return true;
	}

	if ( !check ) {
		return false;
	}

	if ( !req.user.admin ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You are not ADMIN.',
		} ) );
		return true;
	}

	if ( check === 'superAdmin' && req.user.uid !== 0 ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You are not SUPER ADMIN.',
		} ) );
		return true;
	}

	return false;
};
