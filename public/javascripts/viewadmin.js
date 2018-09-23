// vieworder.js
/* eslint-env browser */
/* global MyError fetchHelper addElement removeChildAll l2data */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:on|init)" }] */

l2data.view.admin = true;

const elemAdmin = {};

const l2admin = {

	credentials: {
		Facebook: {},
		Google: {},
		Kakao: {},
		Twitter: {},
	},

	allLocals: {},
	allFacebooks: {},
	allGoogles: {},
	allKakaos: {},
	allTwitters: {},

	errUsers: {},
	errIndex: 0,
	changedData: {},

	setProvider( Provider ) {
		const providerKey = `all${Provider}s`;
		const allProviders = this[providerKey];
		Object.keys( allProviders ).forEach( ( providerID ) => {
			const prov = allProviders[providerID];
			const { uid } = prov;
			delete prov.uidChanged;
			this.errUsers[uid] = this.errUsers[uid] || {};
			const user = this.errUsers[uid];
			user[Provider] = user[Provider] || [];
			const provList = user[Provider];

			provList.push( providerID );
			if ( !user.error && provList.length > 1 ) {
				this.errIndex += 1;
				if ( this.errIndex > 9 ) {
					this.errIndex = 1;
				}
				user.error = this.errIndex;
			}
		} );
	},
	setChanged( Provider, providerID, uidChanged ) {
		this.changedData[Provider] = this.changedData[Provider] || {};
		const changedProv = this.changedData[Provider];
		if ( uidChanged === undefined ) {
			delete changedProv[providerID];
		} else {
			changedProv[providerID] = uidChanged;
		}
	},
	makeTable( Provider ) {
		const tableProvider = elemAdmin[`table${Provider}`];
		removeChildAll( tableProvider );
		const providerKey = `all${Provider}s`;
		const allProviders = this[providerKey];
		Object.keys( allProviders ).sort().forEach( ( providerID ) => {
			const prov = allProviders[providerID];
			const { uid } = prov;
			const user = this.errUsers[uid];

			const tr = addElement( tableProvider, 'tr' );
			let inner = providerID;
			if ( Provider !== 'Local' ) {
				inner += `<BR>${prov.name}`;
			}
			const td1 = addElement( tr, 'td', `cProviderID${user.error ? ` cError${user.error}` : ''}`, inner );
			const td2 = addElement( tr, 'td', user.error ? `cError${user.error}` : '' );
			const input = addElement( td2, 'input', 'cUID' );
			input.type = 'number';
			input.value = uid;
			input.addEventListener( 'change', function onChangeUID() {
				if ( this.value != uid ) {
					prov.uidChanged = this.value;
					this.classList.add( 'cUIDChanged' );
					l2admin.setChanged( Provider, providerID, this.value );
				} else {
					delete prov.uidChanged;
					this.classList.remove( 'cUIDChanged' );
					l2admin.setChanged( Provider, providerID );
				}
				l2admin.checkProviders();
			} );
			prov.td1 = td1;
			prov.td2 = td2;
			prov.input = input;
		} );
	},
	setProviders( data ) {
		this.errUsers = {};
		this.errIndex = 0;
		this.changedData = {};

		const Providers = ['Local', 'Facebook', 'Google', 'Kakao', 'Twitter'];
		Providers.forEach( ( Provider ) => {
			const providerKey = `all${Provider}s`;
			if ( data[providerKey] ) {
				this[providerKey] = data[providerKey];
			}
			this.setProvider( Provider );
		} );

		Providers.forEach( ( Provider ) => {
			this.makeTable( Provider );
		} );
	},

	checkProvider( Provider ) {
		const providerKey = `all${Provider}s`;
		const allProviders = this[providerKey];
		Object.keys( allProviders ).forEach( ( providerID ) => {
			const prov = allProviders[providerID];
			const { uid, uidChanged } = prov;
			const u = uidChanged === undefined ? uid : uidChanged;
			this.errUsers[u] = this.errUsers[u] || {};
			const user = this.errUsers[u];
			user[Provider] = user[Provider] || [];
			const provList = user[Provider];

			provList.push( providerID );
			if ( !user.error && provList.length > 1 ) {
				this.errIndex += 1;
				if ( this.errIndex > 9 ) {
					this.errIndex = 1;
				}
				user.error = this.errIndex;
			}
		} );
	},
	checkTable( Provider ) {
		const providerKey = `all${Provider}s`;
		const allProviders = this[providerKey];
		Object.keys( allProviders ).forEach( ( providerID ) => {
			const prov = allProviders[providerID];
			const { uid, uidChanged } = prov;
			const u = uidChanged === undefined ? uid : uidChanged;
			const user = this.errUsers[u];

			prov.td1.className = `cProviderID${user.error ? ` cError${user.error}` : ''}`;
			prov.td2.className = user.error ? `cError${user.error}` : '';
		} );
	},
	checkProviders() {
		this.errUsers = {};
		this.errIndex = 0;

		const Providers = ['Local', 'Facebook', 'Google', 'Kakao', 'Twitter'];
		Providers.forEach( ( Provider ) => {
			this.checkProvider( Provider );
		} );

		Providers.forEach( ( Provider ) => {
			this.checkTable( Provider );
		} );
	},
};

function onCheckAdminConfig( self, getMsg ) {
	const f = self.form;
	f.clientID.value = f.clientID.value.trim();
	f.clientSecret.value = f.clientSecret.value.trim();
	f.callbackURL.value = f.callbackURL.value.trim();
	// f.clientID.value = f.clientID.value.trime();

	const config = f.config_admin.value;
	const prov = l2admin.credentials[config];

	let cID;
	if ( !f.clientID.value ) {
		cID = 2;
		f.clientID.className = 'adminRed';
	} else if ( f.clientID.value === prov.clientID ) {
		cID = 1;
		f.clientID.className = 'adminWhite';
	} else {
		cID = 0;
		f.clientID.className = 'adminGreen';
	}

	let cSecret;
	if ( !f.clientSecret.value ) {
		cSecret = 2;
		f.clientSecret.className = 'adminRed';
	} else if ( f.clientSecret.value === prov.clientSecret ) {
		cSecret = 1;
		f.clientSecret.className = 'adminWhite';
	} else {
		cSecret = 0;
		f.clientSecret.className = 'adminGreen';
	}

	let cURL;
	if ( !f.callbackURL.value ) {
		cURL = 2;
		f.callbackURL.className = 'adminRed';
	} else if ( f.callbackURL.value === prov.callbackURL ) {
		cURL = 1;
		f.callbackURL.className = 'adminWhite';
	} else {
		cURL = 0;
		f.callbackURL.className = 'adminGreen';
	}

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

	return null;
}

function onSelectConfig( self ) {
	const f = self.form;
	const config = self.value;
	switch ( config ) {
	case 'Facebook':
	case 'Google':
	case 'Kakao':
	case 'Twitter': {
		const prov = l2admin.credentials[config];
		f.clientID.value = prov.clientID || '';
		f.clientSecret.value = prov.clientSecret || '';
		f.callbackURL.value = prov.callbackURL || '';
		// f.profileFields.value= prov.profileFields;
		break;
	}
	default:
		return;
	}
	onCheckAdminConfig( self );
}

function onSelectAuth( self ) {
	const auth = self.value;
	elemAdmin.authList.forEach( ( o ) => {
		if ( o.id.substr( 5 ) === auth ) {
			o.style.display = 'block';
		} else {
			o.style.display = 'none';
		}
	} );
}

function cbAdminList( data ) {
	if ( data.credentials ) {
		l2admin.credentials = data.credentials;
		onSelectConfig( elemAdmin.selectConfig );
	}

	l2admin.setProviders( data );
	onSelectAuth( elemAdmin.selectAuth );
}

function onSubmitAdminConfig( self ) {
	const msg = onCheckAdminConfig( self, true );
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
		input.Provider = config;
		input.clientID = f.clientID.value;
		input.clientSecret = f.clientSecret.value;
		input.callbackURL = f.callbackURL.value;
		// input.profileFields = f.profileFields.values;
		break;
	default:
		return;
	}

	fetchHelper( '/admin', null, input, config, ( data ) => {
		if ( data.code === 'OK' ) {
			cbAdminList( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onResetAdminAuth() {
	l2admin.setProviders( {} );
}

function onSubmitAdminAuth() {
	fetchHelper( '/admin/auth', null, l2admin.changedData, 'changeAuth', ( data ) => {
		if ( data.code === 'OK' ) {
			cbAdminList( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}


function onChangeAdminMenu( menu ) {
	elemAdmin.menuList.forEach( ( o ) => {
		if ( o.id === menu ) {
			o.style.display = 'block';
		} else {
			o.style.display = 'none';
		}
	} );
}

function initAdminElem() {
	elemAdmin.selectConfig	= document.querySelector( '#config_admin' );

	elemAdmin.selectAuth	= document.querySelector( '#auth_admin' );
	elemAdmin.tableLocal		= document.querySelector( '#auth_Local' );
	elemAdmin.tableFacebook	= document.querySelector( '#auth_Facebook' );
	elemAdmin.tableGoogle	= document.querySelector( '#auth_Google' );
	elemAdmin.tableKakao		= document.querySelector( '#auth_Kakao' );
	elemAdmin.tableTwitter	= document.querySelector( '#auth_Twitter' );
	elemAdmin.authList = [
		elemAdmin.tableLocal,
		elemAdmin.tableFacebook,
		elemAdmin.tableGoogle,
		elemAdmin.tableKakao,
		elemAdmin.tableTwitter,
	];

	elemAdmin.divApp		= document.querySelector( '#AdminApp' );
	elemAdmin.divUser		= document.querySelector( '#AdminUser' );
	elemAdmin.menuList = [
		elemAdmin.divApp,
		elemAdmin.divUser,
	];
	onChangeAdminMenu( 'AdminUser' );

	fetchHelper( '/admin/adminList', null, null, 'adminList', cbAdminList );
}
