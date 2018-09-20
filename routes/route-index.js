
const express = require( 'express' );
const icons = require( 'evil-icons' );

const users = require( '../codes/user' );

const router = express.Router();

const useIconList = [
	'ei-cart',
	'si-like',
	'ei-user',
	'ei-pencil',
	'ei-trash',
	'ei-gear',
	'ei-refresh',
	'ei-sc-facebook',
	'ei-sc-twitter',
	'ei-sc-google-plus',
	'ei-sc-github',
];

const getIconCache = ( () => {
	const cache = {};

	return ( theme ) => {
		let data = cache[theme];
		if ( !data ) {
			cache[theme] = {};
			data = cache[theme];
			useIconList.forEach( ( list ) => {
				const key = list.substr( 2 ).replace( '-', '' );
				data[key] = icons.icon( list, { size: 'm', class: theme } );
			} );
		}
		return data;
	};
} )();

router.get( '/', ( req, res ) => {
	const params = {};
	if ( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid;
		params.loginID = users.getAuthID( 'Local', req.user.uid );
		if ( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	}
	const currentTheme = 'ei-custom';
	params.icons = getIconCache( currentTheme );

	res.render( 'index', params );
} );

module.exports = router;
