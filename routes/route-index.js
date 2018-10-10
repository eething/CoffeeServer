
const express = require( 'express' );
const icons = require( 'evil-icons' );

const users = require( '../codes/user' );

const router = express.Router();

const useIconList = [
	{ key: 'cart',		name: 'ei-cart' },
	{ key: 'like',		name: 'si-like' },
	{ key: 'user',		name: 'ei-user' },
	{ key: 'pencil',	name: 'ei-pencil' },
	{ key: 'trash',		name: 'ei-trash' },
	{ key: 'gear',		name: 'ei-gear' },
	{ key: 'refresh',	name: 'ei-refresh' },
	{ key: 'facebook',	name: 'ei-sc-facebook' },
	{ key: 'twitter',	name: 'ei-sc-twitter' },
	{ key: 'google',	name: 'ei-sc-google-plus' },
	{ key: 'github',	name: 'ei-sc-github' },
];

const getIconCache = ( () => {
	const cache = {};

	return ( theme ) => {
		let data = cache[theme];
		if ( !data ) {
			cache[theme] = {};
			data = cache[theme];
			useIconList.forEach( ( list ) => {
				const { key, name } = list;
				data[key] = icons.icon( name, { size: 'm', class: theme } );
			} );
		}
		return data;
	};
} )();

/*
function getUserTheme( user ) {
	if ( user.theme ) {
		return user.theme;
	}
	const themeList = ['blue', 'dark', 'hellokitty', 'ncsoft'];
	const randIndex = Math.floor( Math.random() * themeList.length );
	return themeList[randIndex];
}
*/

router.get( '/', ( req, res ) => {
	const params = {};
	if ( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid;
		params.loginID = users.getAuthID( 'Local', req.user.uid );
		params.loginTheme = req.user.theme || 'random';

		if ( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	} else {
		params.loginTheme = 'random';
	}

	const errorList = req.flash( 'error' );
	if ( errorList.length > 0 ) {
		params.loginError = JSON.stringify( errorList[errorList.length - 1] );
	}

	const currentTheme = 'ei-custom';
	params.icons = getIconCache( currentTheme );

	res.render( 'index', params );
} );

module.exports = router;
