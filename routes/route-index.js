'use strict';

const users = require( '../codes/user' );
const icons = require( 'evil-icons' );
const express = require( 'express' );

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
	'ei-sc-github'
];

let getIconCache = ( function () {

	let cache = {};

	return function ( theme ) {
		let data = cache[ theme ];
		if( !data ) {
			data = cache[ theme ] = {};
			useIconList.forEach( list => {
				const key = list.substr( 2 ).replace( '-', '' );
				data[ key ] = icons.icon( list, { size: 'm', class: theme } );
			} );
		}
		return data;
	}
} )();

router.get( '/', function ( req, res ) {
	let params = {};
	if( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid;
		params.loginID = users.authTable[ req.user.uid ].local;
		if( req.user.admin ) {
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
