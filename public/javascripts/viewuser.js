// vieworder.js
/* eslint-env browser */
/* global MyError fetchHelper addElement removeChildAll l2data l2all l2order l2admin */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:on|init)" }] */

l2data.view.user = true;

const elemUser = {};

function changeUserMenu( menu ) {
	elemUser.menuList.forEach( ( o ) => {
		if ( o.className.substr( 1 ) === menu ) {
			o.style.display = 'block';
		} else {
			o.style.display = 'none';
		}
	} );
}

function setTheme( theme ) {
	let t = theme;
	if ( t === 'random' ) {
		const themeList = ['blue', 'dark', 'hellokitty', 'ncsoft'];
		const randIndex = Math.floor( Math.random() * themeList.length );
		t = themeList[randIndex];
	}
	console.log( t );
	const styleList = ['bg1', 'bg2', 'separator', 'border', 'border-light', 'text', 'text-button'];
	styleList.forEach( ( s ) => {
		const themeName = `--${t}-${s}`;
		const styleName = `--${s}`;

		const { style } = document.styleSheets[0].rules[0];
		style.setProperty( styleName, style.getPropertyValue( themeName ) );
	} );
}

function changeLoginData( loginType, loginName, loginID, loginUID, loginTheme ) {
	// Type
	l2data.login.type = loginType;
	elemUser.spanLogin.style.display	= loginType ? 'none' : 'inline-block';
	elemUser.spanRegister.style.display	= loginType ? 'none' : 'inline-block';
	elemUser.spanMyInfo.style.display	= loginType ? 'inline-block' : 'none';
	elemUser.spanLogout.style.display	= loginType ? 'inline-block' : 'none';
	elemUser.spanAdmin.style.display	= loginType === 'admin' ? 'inline-block' : 'none';
	if ( l2data.view.all ) {
		l2all.showAdminMenu( loginType === 'admin' );
	}
	let menu;
	if ( !loginType ) {
		menu = 'Login';
	} else if ( loginType === 'admin' ) {
		menu = 'Admin';
	} else {
		menu = 'MyInfo';
	}
	changeUserMenu( menu );
	// Name
	l2data.login.name = loginName;
	document.querySelector( '#name_edit' ).value = loginName || '';
	// ID
	l2data.login.ID = loginID;
	document.querySelector( '#id_edit' ).innerHTML = l2data.login.ID || '';
	document.querySelector( '#password1_edit' ).disabled = !l2data.login.ID;
	document.querySelector( '#password2_edit' ).disabled = !l2data.login.ID;
	// uid
	l2data.login.uid = loginUID;
	// theme
	console.log( 'loginTheme', loginTheme );
	l2data.login.theme = loginTheme || 'random';
	const radioTheme = `#theme_${l2data.login.theme}`;
	document.querySelector( radioTheme ).checked = true;
	setTheme( l2data.login.theme );
}

function onLogout() {
	fetchHelper( '/auth/logout', null, null, 'Logout', ( data ) => {
		if ( data.code === 'OK' ) {
			changeLoginData();
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function processLoginOK( d ) {
	changeLoginData( d.admin ? 'admin' : 'user', d.name, d.id, d.uid, d.theme );
	l2data.setData( d );
	if ( l2data.view.all ) {
		l2all.changePage( 'Order' );
		l2order.selectOrderBy();
		if ( d.admin ) {
			l2admin.getAdminList();
		}
	}
}

function onLogin( self ) {
	const f = self.form;
	const input = {
		id: f.id.value,
		password: f.password.value,
	};
	f.id.value = '';
	f.password.value = '';

	fetchHelper( '/auth/login', null, input, 'Login', ( data ) => {
		if ( data.code === 'OK' ) {
			processLoginOK( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onLoginProvider( Provider ) {
	window.open( `/auth/${Provider}` );
}

window.providerCallbackOK = ( loginType, loginName, loginID, loginUID, loginTheme ) => {
	changeLoginData( loginType, loginName, loginID, loginUID, loginTheme );
	if ( l2data.view.all ) {
		l2all.changePage( 'Order' );
	}
	l2data.getAllList();
};

window.providerCallbackSame = () => {};

window.providerCallbackAsk = ( input ) => {
	const desc = `${input.Provider}Associate`;
	fetchHelper( '/auth/associate', null, input, desc, ( data ) => {
		if ( data.code === 'YES' ) {
			console.log( 'YES' );
		} else if ( data.code === 'NO' ) {
			console.log( 'NO' );
		} else {
			throw new MyError( 500, data );
		}
	} );
};

function submitUser( mode, input, cb ) {
	fetchHelper( `/user/${mode}`, null, input, mode, ( data ) => {
		if ( data.code === 'OK' ) {
			l2data.setData( data );
			cb( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onCheckEditForm( self, getMsg ) {
	const f = self.form;
	const fName = f.name_edit;
	const fPassword1 = f.password1_edit;
	const fPassword2 = f.password2_edit;

	// let hasChange = fPassword1.value ? true : false;
	let hasChange = !!fPassword1.value;

	const errP2 = ( fPassword1.value === fPassword2.value ) ? 0 : 1;
	if ( errP2 === 1 ) {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userRed';
	} else if ( hasChange ) {
		fPassword1.className = 'userGreen';
		fPassword2.className = 'userGreen';
	} else {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userWhite';
	}

	fName.value = fName.value.trim();
	const changeName = ( fName.value === l2data.login.name ) ? 0 : 1;
	fName.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if ( !getMsg ) {
		return null;
	}

	let msg;
	if ( errP2 ) {
		return '비밀번호가 다릅니다.';
	}
	const changeTheme = f.theme.value !== l2data.login.theme;
	if ( changeName || changeTheme ) {
		hasChange = true;
	}
	if ( !hasChange ) {
		msg = '변경사항이 없습니다.';
	}
	return msg;
}

function onEditUser( self ) {
	const f = self.form;

	const msg = onCheckEditForm( self, true );
	if ( msg ) {
		alert( msg );
		return;
	}

	const input = {
		name: f.name_edit.value,
		password: f.password1_edit.value,
		theme: f.theme.value,
	};
	submitUser( 'editUser', input, () => {
		l2data.login.name = f.name_edit.value;
		l2data.login.theme = f.theme.value;

		f.password1_edit.value		= '';
		f.password2_edit.value		= '';

		f.name_edit.className		= 'userWhite';
		f.password1_edit.className	= 'userWhite';
		f.password2_edit.className = 'userWhite';

		setTheme( f.theme.value );
	} );
}

function disableAdminForm( f, b ) {
	f.name_admin.disabled		= b;
	f.password1_admin.disabled	= b;
	f.password2_admin.disabled	= b;
	f.del_admin.disabled		= b;
	f.enable_admin.disabled		= b;
	f.button_admin.disabled		= b;
	f.button_del.disabled		= b;
}

function onCheckAdminForm( self, getMsg ) {
	const f = self.form;
	const fName = f.name_admin;
	const fPassword1 = f.password1_admin;
	const fPassword2 = f.password2_admin;

	let hasChange = !!fPassword1.value;

	const errP2 = ( fPassword1.value === fPassword2.value ) ? 0 : 1;
	if ( errP2 === 1 ) {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userRed';
	} else if ( hasChange ) {
		fPassword1.className = 'userGreen';
		fPassword2.className = 'userGreen';
	} else {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userWhite';
	}

	const uid = f.idSelect.value;
	/*
	let orgName = '';
	let changeDel = false;
	let changeEnable = false;
	let changeShuttle = false;
	if ( uid > 0 ) {
	*/
	const user = l2data.allUsers[uid];
	const orgName = user.name;
	const changeDel = f.del_admin.checked !== ( user.deleted === true );
	const changeEnable = f.enable_admin.checked !== ( user.enabled === true );
	const changeShuttle = f.shuttle_admin.checked !== ( user.shuttle === true );
	f.del_admin.className = `c${f.del_admin.checked ? 'True' : 'False'} ${changeDel ? 'cChanged' : 'cNoChange'}`;
	f.enable_admin.className = `c${f.enable_admin.checked ? 'True' : 'False'} ${changeEnable ? 'cChanged' : 'cNoChange'}`;
	f.shuttle_admin.className = `c${f.shuttle_admin.checked ? 'True' : 'False'} ${changeShuttle ? 'cChanged' : 'cNoChange'}`;
	// }

	fName.value = fName.value.trim();
	const changeName = ( fName.value === orgName ) ? 0 : 1;
	fName.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if ( !getMsg ) {
		return null;
	}

	let msg;
	if ( uid < 0 ) {
		return '유저를 선택해 주세요.';
	}
	if ( errP2 ) {
		return '비밀번호가 다릅니다.';
	}
	if ( changeName || changeDel || changeEnable || changeShuttle ) {
		hasChange = true;
	}
	if ( !hasChange ) {
		msg = '변경사항이 없습니다.';
	}
	return msg;
}

function onAdminUser( self ) {
	const f = self.form;

	const msg = onCheckAdminForm( self, true );
	if ( msg ) {
		alert( msg );
		return;
	}

	const newName = f.name_admin.value;
	const editMe = ( f.idSelect.value === l2data.login.uid.toString() );

	const input = {
		uid: f.idSelect.value,
		name: f.name_admin.value,
		password: f.password1_admin.value,
		deleted: f.del_admin.checked,
		enabled: f.enable_admin.checked,
		shuttle: f.shuttle_admin.checked,
	};
	submitUser( 'adminUser', input, () => {
		if ( editMe ) {
			l2data.login.name = newName;
			// const user = l2data.allUsers[l2data.login.uid];
			// user.name = newName;
			// user.id = l2data.login.ID = newID;
		}
		// f.name_admin.value		= '';
		f.password1_admin.value	= '';
		f.password2_admin.value	= '';

		f.name_admin.className		= 'userWhite';
		f.password1_admin.className	= 'userWhite';
		f.password2_admin.className	= 'userWhite';
	} );
}

// delUser 는 무조건 admin 기능으로 바꾸려고 함
function onDelUser( self ) {
	const f = self.form;
	// if( admin ) {
	//	var msg = '탈퇴하시겠습니까?';
	// } else {
	const uid = f.idSelect.value;
	if ( uid < 0 ) {
		alert( '유저를 선택해 주세요.' );
		return;
	}
	const user = l2data.allUsers[uid];
	const userName = user.name || user.localID || `* ${uid}`;
	const msg = `${userName} 를 삭제하시겠습니까?`;
	// }

	if ( confirm( msg ) ) {
		const input = { uid };
		submitUser( 'delUser', input, () => {} );
	}
}

function onSelectUser( self ) {
	const f = self.form;
	const uid = self.value;
	const user = l2data.allUsers[uid];
	if ( !user ) {
		disableAdminForm( f, true );
		return;
	}

	disableAdminForm( f, false );
	document.querySelector( '#uid_admin' ).innerHTML = uid;
	document.querySelector( '#id_admin' ).innerHTML = user.localID || '';
	f.name_admin.value = user.name || '';
	f.del_admin.checked = user.deleted; // ? true : false;
	f.enable_admin.checked = user.enabled; // ? true : false;
	f.shuttle_admin.checked = user.shuttle; // ? true : false;

	const Providers = ['Facebook', 'Google', 'Kakao', 'Twitter'];
	Providers.forEach( ( Provider ) => {
		const providerView = document.querySelector( `#${Provider}_view` );
		const providerDel = document.querySelector( `#${Provider}_del` );
		if ( user.auth && user.auth[Provider] ) {
			providerView.value = user.auth[Provider].name;
			providerView.disabled = false;
			providerDel.disabled = false;
		} else {
			providerView.value = '';
			providerView.disabled = true;
			providerDel.disabled = true;
		}
	} );

	onCheckAdminForm( self );
}

function onViewProvider( self, Provider ) {
	const f = self.form;
	const uid = f.idSelect.value;
	const user = l2data.allUsers[uid];
	if ( !user.auth ) {
		return;
	}
	const prov = user.auth[Provider];
	let msg = `UID: ${prov.uid}\nNAME: ${prov.name}\nID: ${prov.id}`;
	if ( prov.id !== prov.providerID ) {
		msg += `\nproviderID: ${prov.providerID} (${typeof prov.providerID})`;
	}
	alert( msg );
}

function initUserElem( loginType, loginName, loginID, loginUID, loginTheme ) {
	elemUser.spanLogin		= document.querySelector( '#menuLogin' );
	elemUser.spanRegister	= document.querySelector( '#menuRegister' );
	elemUser.spanMyInfo		= document.querySelector( '#menuMyInfo' );
	elemUser.spanAdmin		= document.querySelector( '#menuAdmin' );
	elemUser.spanLogout		= document.querySelector( '#menuLogout' );

	elemUser.divLogin		= document.querySelector( 'div.cLogin' );
	elemUser.divNewUser		= document.querySelector( 'div.cNewUser' );
	elemUser.divMyInfo		= document.querySelector( 'div.cMyInfo' );
	elemUser.divAdmin		= document.querySelector( 'div.cAdmin' );

	elemUser.menuList = [
		elemUser.divLogin,
		elemUser.divNewUser,
		elemUser.divMyInfo,
		elemUser.divAdmin,
	];

	changeLoginData( loginType, loginName, loginID, loginUID, loginTheme );
}

const l2user = {
	duplicatedID: -1,

	cbUserList() {
		const select = document.querySelector( '#idSelect' );
		removeChildAll( select );

		Object.keys( l2data.allUsers ).forEach( ( uid ) => {
			const user = l2data.allUsers[uid];
			const userName = user.name || user.localID || `* ${uid}`;
			const option = addElement( select, 'option', '', userName );
			option.value = uid;
		} );

		if ( select.length === 0 ) {
			const option = addElement( select, 'option', '', 'NNUULL' );
			option.value = -1;
		}

		onSelectUser( select );
	},
};

function onCheckDuplicatedID( self ) {
	const f = self.form;
	f.id_add.value = f.id_add.value.trim();
	const input = { id: f.id_add.value };
	if ( !input.id ) {
		return;
	}
	fetchHelper( '/user/duplicatedID', null, input, 'Logout', ( data ) => {
		if ( data.code === 'OK' ) {
			l2user.duplicatedID = 1;
			f.id_add.className = 'userGreen';
		} else if ( data.code === 'EUSERID' ) {
			l2user.duplicatedID = 0;
			f.id_add.className = 'userRed';
		} else {
			throw new MyError( 500, data );
		}
	} );
}

const onCheckIDChanged = ( function outer() {
	let previousID = '';
	return ( function inner( self ) {
		const f = self.form;
		f.id_add.value = f.id_add.value.trim();
		if ( previousID !== f.id_add.value ) {
			l2user.duplicatedID = -1;
			f.id_add.className = 'userYellow';
			previousID = f.id_add.value;
		}
	} );
}() );

function onCheckAddForm( self, getMsg ) {
	const f = self.form;
	f.name_add.value = f.name_add.value.trim();

	const errP1 = f.password1_add.value ? 0 : 1;
	const errP2 = ( f.password1_add.value === f.password2_add.value ) ? 0 : 1;
	f.password1_add.className = ( errP1 === 1 ) ? 'userRed' : 'userWhite';
	f.password2_add.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	if ( !errP1 && !errP2 ) {
		f.password1_add.className = 'userGreen';
		f.password2_add.className = 'userGreen';
	} else if ( errP1 === 1 ) {
		f.password1_add.className = 'userRed';
		f.password2_add.className = 'userWhite';
	} else if ( errP2 === 1 ) {
		f.password1_add.className = 'userWhite';
		f.password2_add.className = 'userRed';
	} else {
		f.password1_add.className = 'userRed';
		f.password2_add.className = 'userWhite';
	}

	if ( !getMsg ) {
		return null;
	}

	let msg = '';
	if ( l2user.duplicatedID === -1 ) {
		msg = 'ID 중복체크 하세요.';
	} else if ( l2user.duplicatedID === 0 ) {
		msg = '이미 존재하는 ID 입니다.';
	}
	if ( errP1 ) {
		msg = `${msg ? `${msg}\n` : ''}비밀번호 를 입력해주세요`;
	} else if ( errP2 ) {
		msg = `${msg ? `${msg}\n` : ''}비밀번호가 일치하지 않습니다`;
	}
	return msg;
}

function onAddUser( self ) {
	const msg = onCheckAddForm( self, true );
	if ( msg ) {
		alert( msg );
		return;
	}
	const f = self.form;
	const input = {
		name: f.name_add.value,
		id: f.id_add.value,
		password: f.password1_add.value,
	};
	submitUser( 'addUser', input, ( data ) => {
		changeLoginData( 'user' );
		l2data.login.name = data.name;
		l2data.login.ID = data.id;
		l2data.login.uid = data.uid;

		document.querySelector( '#name_edit' ).value = l2data.login.name || '';
		document.querySelector( '#id_edit' ).innerHTML = l2data.login.ID || '';
		f.password1_edit.disabled = !l2data.login.ID;
		f.password2_edit.disabled = !l2data.login.ID;

		f.id_add.value = '';
		f.name_add.value = '';
		f.password1_add.value = '';
		f.password2_add.value = '';

		f.id_add.className = 'userYellow';
		f.name_add.className = 'userWhite';
		f.password1_add.className = 'userRed';
		f.password2_add.className = 'userWhite';

		if ( l2data.view.all ) {
			l2all.changePage( 'Order' );
		}
	} );
}
