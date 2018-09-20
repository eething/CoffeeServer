// vieworder.js
/* global fetchHelper l2data elem */
/* eslint-env browser */

l2data.view.admin = true;

function initAdminElem() {
	elem.selectConfigAdmin = document.querySelector( '#config_admin' );
	checkAdminForm( elem.selectConfigAdmin );

	fetchHelper( '/admin/list', null, null, 'adminList', l2admin.cbAdminList );
}

const l2admin = {

	credentials: {
		Facebook: {
			clientID: '',
			clientSecret: '',
			callbackURL: '',
			// profileFields: [],
		},
		Google: {},
		Kakao: {},
		Twitter: {},
	},

	cbAdminList( data ) {
		if ( !data.credentials ) {
			return;
		}
		l2admin.credentials = data.credentials;
		onSelectConfig( elem.selectConfigAdmin );
	},
};

function checkAdminForm( self, getMsg ) {
	const f = self.form;
	f.clientID.value		= f.clientID.value.trim();
	f.clientSecret.value	= f.clientSecret.value.trim();
	f.callbackURL.value		= f.callbackURL.value.trim();
	// f.clientID.value = f.clientID.value.trime();

	const config = f.config_admin.value;
	const prov = l2admin.credentials[config];

	const cID		=	!f.clientID.value ? 2 :
						f.clientID.value === prov.clientID ? 1 : 0;
	const cSecret	=	!f.clientSecret.value ? 2 :
						f.clientSecret.value === prov.clientSecret ? 1 : 0;
	const cURL		=	!f.callbackURL.value ? 2 :
						f.callbackURL.value === prov.callbackURL ? 1 : 0;

	f.clientID.className
		= cID === 2 ? 'adminRed' : cID === 1 ? 'adminWhite' : 'adminGreen';
	f.clientSecret.className
		= cSecret === 2 ? 'adminRed' : cSecret === 1 ? 'adminWhite' : 'adminGreen';
	f.callbackURL.className
		= cURL === 2 ? 'adminRed' : cURL === 1 ? 'adminWhite' : 'adminGreen';

	if ( !getMsg ) {
		return null;
	}

	let msg = '';
	if ( cID === 2 ) {
		msg = 'clientID';
	}
	if ( cSecret === 2 ) {
		msg = `${msg ? `${msg}, ` : ''}clientSecret`;
	}
	if ( cURL === 2 ) {
		msg = `${msg ? `${msg}, ` : ''}callbackURL`;
	}
	if ( msg ) {
		return `${msg} 를 입력해 주세요.`;
	}
	if ( cID * cSecret * cURL === 1 ) {
		return '변경사항이 없습니다.';
	}
}

function changeAdminConfig( self ) {
	const msg = checkAdminForm( self, true );
	if ( msg ) {
		alert( msg );
		return;
	}

	const input = {};
	const f = self.form;
	const config = f.config_admin.value;
	switch ( config ) {
	case 'Facebook':
	case 'Google':
	case 'Kakao':
	case 'Twitter':
		input.Provider		= config;
		input.clientID		= f.clientID.value;
		input.clientSecret	= f.clientSecret.value;
		input.callbackURL	= f.callbackURL.value;
		// input.profileFields = f.profileFields.values;
		break;

	default:
		return;
	}

	fetchHelper( '/admin', null, input, config, ( data ) => {
		if ( data.code === 'OK' ) {
			l2admin.cbAdminList( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onSelectConfig( self ) {
	const f = self.form;
	const config = self.value;
	switch ( config ) {
	case 'Facebook':
	case 'Google':
	case 'Kakao':
	case 'Twitter':
		onSelectProvider( config, f );
		break;

	default:
		break;
	}
	checkAdminForm( self );
}

function onSelectProvider( Provider, f ) {
	const prov = l2admin.credentials[Provider];
	f.clientID.value		= prov.clientID || '';
	f.clientSecret.value	= prov.clientSecret || '';
	f.callbackURL.value		= prov.callbackURL || '';
//	f.profileFields.value	= prov.profileFields;
}
