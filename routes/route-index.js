'use strict';
var icons = require( 'evil-icons' );
var express = require( 'express' );

var router = express.Router();

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

	const currentTheme = 'ei-custom';

	res.render( 'index', { icons: getIconCache( 'ei-custom' ) } );

} );

module.exports = router;
