// vieworder.js

l2data.view.admin = true;

function initAdminElem() {
	elem.selectConfigAdmin = document.querySelector( '#config_admin' );
	checkAdminForm( elem.selectConfigAdmin );

	fetchHelper( '/admin/list', null, 'adminList', l2admin.cbAdminList );
}

l2admin = {

	credentials: {
		Facebook: {
			clientID: '',
			clientSecret: '',
			callbackURL: ''
			//profileFields: [],
		},
		Google: {},
		Kakao: {},
		Twitter: {}
	},

	cbAdminList( data ) {
		if( !data.credentials ) {
			return;
		}
		l2admin.credentials = data.credentials;
		onSelectConfig( elem.selectConfigAdmin );
	}
};

function checkAdminForm( self, getMsg ) {
	const f = self.form;
	f.clientID.value		= f.clientID.value.trim();
	f.clientSecret.value	= f.clientSecret.value.trim();
	f.callbackURL.value		= f.callbackURL.value.trim();
	//f.clientID.value = f.clientID.value.trime();

	const fb = l2admin.credentials.Facebook;

	const cID		=	!f.clientID.value ? 2 :
						f.clientID.value === fb.clientID ? 1 : 0;
	const cSecret	=	!f.clientSecret.value ? 2 :
						f.clientSecret.value === fb.clientSecret ? 1 : 0;
	const cURL		=	!f.callbackURL.value ? 2 :
						f.callbackURL.value === fb.callbackURL ? 1 : 0;

	f.clientID.className
		= cID === 2 ? 'adminRed' : cID === 1 ? 'adminWhite' : 'adminGreen';
	f.clientSecret.className
		= cSecret === 2 ? 'adminRed' : cSecret === 1 ? 'adminWhite' : 'adminGreen';
	f.callbackURL.className
		= cURL === 2 ? 'adminRed' : cURL === 1 ? 'adminWhite' : 'adminGreen';

	if( !getMsg ) {
		return;
	}

	let msg = '';
	if( cID === 2 ) {
		msg = 'clientID';
	}
	if( cSecret === 2 ) {
		msg = `${msg ? `${msg}, ` : ''}clientSecret`;
	}
	if( cURL === 2 ) {
		msg = `${msg ? `${msg}, ` : ''}callbackURL`;
	}
	if( msg ) {
		return msg + ' 를 입력해 주세요.';
	}
	if( cID * cSecret * cURL === 1 ) {
		return '변경사항이 없습니다.';
	}
}

function changeAdminConfig( self ) {

	const msg = checkAdminForm( self, true );
	if( msg ) {
		alert( msg );
		return;
	}

	const input = {};
	const f = self.form;
	const config = f.config_admin.value;
	switch ( config ) {
		case 'Facebook':
			input.clientID		= f.clientID.value;
			input.clientSecret	= f.clientSecret.value;
			input.callbackURL	= f.callbackURL.value;
//			input.profileFields	= f.profileFields.values;
			break;
		case 'Google':

			break;
		case 'Kakao':

			break;
		case 'Twitter':

			break;
	}

	fetchHelper( `/admin/${config}`, input, config, data => {
		if( data.code === 'OK' ) {
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
			onSelectFacebook( f );
			break;
		case 'Google':
			onSelectGoogle( f );
			break;
		case 'Kakao':
			onSelectKakao( f );
			break;
		case 'Twitter':
			onSelectTwitter( f );
			break;
	}
	checkAdminForm( self );
}

function onSelectFacebook( f ) {
	const fb = l2admin.credentials.Facebook;
	f.clientID.value		= fb.clientID;
	f.clientSecret.value	= fb.clientSecret;
	f.callbackURL.value		= fb.callbackURL;
//	f.profileFields.value	= fb.profileFields;
}

function onSelectGoogle( f ) {

}

function onSelectKakao( f ) {

}

function onSelectTwitter( f ) {

}
