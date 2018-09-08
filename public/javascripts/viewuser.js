﻿// vieworder.js

l2data.view.user = true;

function initUserElem( loginType, loginName, loginID, loginUID ) {

	elem.spanLogin		= document.querySelector( '#menuLogin' );
	elem.spanRegister	= document.querySelector( '#menuRegister' );
	elem.spanMyInfo		= document.querySelector( '#menuMyInfo' );
	elem.spanAdmin		= document.querySelector( '#menuAdmin' );
	elem.spanLogout		= document.querySelector( '#menuLogout' );

	elem.divLogin		= document.querySelector( 'div.cLogin' );
	elem.divNewUser		= document.querySelector( 'div.cNewUser' );
	elem.divMyInfo		= document.querySelector( 'div.cMyInfo' );
	elem.divAdmin		= document.querySelector( 'div.cAdmin' );

	elem.userList = [
		elem.divLogin,
		elem.divNewUser,
		elem.divMyInfo,
		elem.divAdmin
	];

	changeLoginData( loginType, loginName, loginID, loginUID );
}

l2user = {
	duplicatedID: -1,

	cbUserList() {
		let select = document.querySelector( '#idSelect' );
		removeChildAll( select );

		for( const uid in l2data.allUsers ) {
			let user = l2data.allUsers[uid];
			//let text = `${uid} / ${user.name||''} / ${user.id}`;
			let username = user.name || user.id;
			let option = addElement( select, 'option', '', username );
			option.value = uid;
		}
//		select.form.uid.value = select.value;
		onSelectUser( select );
	}
}

function logout() {
	fetchHelper( '/auth/logout', null, 'Logout', data => {
		if( data.code == 'OK' ) {
			changeLoginData();
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function login( self ) {

	const f = self.form;
	const data = {
		id: f.id.value,
		password: f.password.value
	}
	f.id.value = '';
	f.password.value = '';

	fetchHelper( '/auth/login', data, 'Login', data => {
		if( data.code == 'OK' ) {
			l2data.setData( data );
			changeLoginData( data.admin ? 'admin' : 'user', data.name, data.id, data.uid );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function checkDuplicatedID( self ) {
	const f = self.form;
	f.id_add.value = f.id_add.value.trim();
	const data = { id: f.id_add.value };
	if( !data.id ) {
		return;
	}
	fetchHelper( '/user/duplicatedID', data, 'Logout', data => {
		if( data.code === 'OK' ) {
			l2user.duplicatedID = 1;
			f.id_add.className = 'userGreen';
		} else if( data.code === 'EUSERID' ) {
			l2user.duplicatedID = 0;
			f.id_add.className = 'userRed';
		} else {
			throw new MyError( 500, data );
		}
	} );
}

const checkIDChanged = function () {
	previousID = '';
	return function ( self ) {
		const f = self.form;
		f.id_add.value = f.id_add.value.trim();
		if( previousID != f.id_add.value ) {
			l2user.duplicatedID = -1;
			f.id_add.className = 'userYellow';
			previousID = f.id_add.value;
		}
	}
}();

function checkAddForm( self, getMsg ) {
	const f = self.form;
	f.name_add.value = f.name_add.value.trim();

	const errP1 = f.password1_add.value ? 0 : 1;
	const errP2 = ( f.password1_add.value === f.password2_add.value ) ? 0 : 1;
	f.password1_add.className = ( errP1 === 1 ) ? 'userRed' : 'userWhite';
	f.password2_add.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	if( !errP1 && !errP2 ) {
		f.password1_add.className = 'userGreen';
		f.password2_add.className = 'userGreen';
	} else if( errP1 === 1 ) {
		f.password1_add.className = 'userRed';
		f.password2_add.className = 'userWhite';
	} else if( errP2 === 1 ) {
		f.password1_add.className = 'userWhite';
		f.password2_add.className = 'userRed';
	} else {
		f.password1_add.className = 'userRed';
		f.password2_add.className = 'userWhite';
	}

	if( !getMsg ) {
		return;
	}

	let msg = '';
	if( l2user.duplicatedID == -1 ) {
		msg = 'ID 중복체크 하세요.';
	} if( l2user.duplicatedID == 0 ) {
		msg = '이미 존재하는 ID 입니다.';
	}
	if( errP1 ) {
		msg = `${msg ? `${msg}\n` : ''}비밀번호 를 입력해주세요`;
	} else if( errP2 ) {
		msg = `${msg ? `${msg}\n` : ''}비밀번호가 일치하지 않습니다`;
	}
	return msg;
}

function addUser( self ) {

	const msg = checkAddForm( self, true );
	if( msg ) {
		alert( msg );
		return;
	}
	const f = self.form;
	const input = {
		name: f.name_add.value,
		id: f.id.value,
		password: f.password1_add.value
	};
	submitUser( 'addUser', input, data => {
		changeLoginData( 'user' );
		l2data.login.name	= data.name;
		l2data.login.ID		= data.id;
		l2data.login.uid	= data.uid;
		document.querySelector( '#id_edit').innerHTML = l2data.login.ID;
		document.querySelector( '#name_edit').value = l2data.login.name;

		f.id_add.value				= '';
		f.name_add.value			= '';
		f.password1_add.value		= '';
		f.password2_add.value		= '';

		f.id_add.className			= 'userYellow';
		f.name_add.className		= 'userWhite';
		f.password1_add.className	= 'userRed';
		f.password2_add.className	= 'userWhite';

		l2data.getUserList( l2user.cbUserList );
	} );
}

function checkEditForm( self, admin, getMsg ) {

	const f = self.form;
	const fName = f.name_edit;
	const fPassword1 = f.password1_edit;
	const fPassword2 = f.password2_edit;

	let hasChange = fPassword1.value ? true : false;

	const errP2 = ( fPassword1.value === fPassword2.value ) ? 0 : 1;
	if( errP2 === 1 ) {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userRed';
	} else if( hasChange ) {
		fPassword1.className = 'userGreen';
		fPassword2.className = 'userGreen';
	} else {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userWhite';
	}

	const changeDel = false;
	const changeEnable = false;
	const orgName = l2data.login.name;

	fName.value = fName.value.trim();
	const changeName = ( fName.value === orgName ) ? 0 : 1;
	fName.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let msg;
	if( errP2 ) {
		return '비밀번호가 다릅니다.';
	}
	if( changeName || changeDel || changeEnable ) {
		hasChange = true;
	}
	if( !hasChange ) {
		msg = '변경사항이 없습니다.'
	}
	return msg;
}

function editUser( self ) {

	const f = self.form;

	const msg = checkEditForm( self, true );
	if( msg ) {
		alert( msg );
		return;
	}

	const newName = f.name_edit.value;
	const editMe = true;

	const input = {
		//uid: -1,
		name: f.name_edit.value,
		password: f.password1_edit.value
	}
	submitUser( 'editUser', input, () => {
		if( editMe ) {
			const user = l2data.allUsers[ l2data.login.uid ];
			user.name = l2data.login.name = newName;
			//user.id = l2data.login.ID = newID;			
		}
		//f.name_edit.value			= '';
		f.password1_edit.value		= '';
		f.password2_edit.value		= '';

		f.name_edit.className		= 'userWhite';
		f.password1_edit.className	= 'userWhite';
		f.password2_edit.className	= 'userWhite';
	} );
}

function checkAdminForm( self, getMsg ) {

	const f = self.form;
	const fName = f.name_admin;
	const fPassword1 = f.password1_admin;
	const fPassword2 = f.password2_admin;

	let hasChange = fPassword1.value ? true : false;

	const errP2 = ( fPassword1.value === fPassword2.value ) ? 0 : 1;
	if( errP2 === 1 ) {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userRed';
	} else if( hasChange ) {
		fPassword1.className = 'userGreen';
		fPassword2.className = 'userGreen';
	} else {
		fPassword1.className = 'userWhite';
		fPassword2.className = 'userWhite';
	}

	const uid = document.querySelector( '#uid_admin' ).innerHTML;
	const user = l2data.allUsers[uid];
	const orgName = user.name;
	const changeDel = f.del_admin.checked != user.deleted;
	const changeEnable = f.enable_admin.checked != user.enabled;
	// TODO - deleted, enabled 도 배경색 바꿔주자

	fName.value = fName.value.trim();
	const changeName = ( fName.value === orgName ) ? 0 : 1;
	fName.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let msg;
	if( errP2 ) {
		return '비밀번호가 다릅니다.';
	}
	if( changeName || changeDel || changeEnable ) {
		hasChange = true;
	}
	if( !hasChange ) {
		msg = '변경사항이 없습니다.'
	}
	return msg;
}

function adminUser( self ) {

	const f = self.form;

	const msg = checkAdminForm( self, true );
	if( msg ) {
		alert( msg );
		return;
	}

	const newName = f.name_admin.value;
	const editMe = ( f.idSelect.value == l2data.login.uid );
//	const editMe = ( f.uid.value == l2data.login.uid );

	const input = {
		uid: f.idSelect.value,
//		uid: f.uid.value,
		name: f.name_admin.value,
		password: f.password1_admin.value,
		deleted: f.del_admin.checked,
		enabled: f.enable_admin.checked
	}
	submitUser( 'adminUser', input, () => {
		if( editMe ) {
			const user = l2data.allUsers[ l2data.login.uid ];
			user.name = l2data.login.name = newName;
			//user.id = l2data.login.ID = newID;
		}

		f.name_admin.value		= '';
		f.password1_admin.value	= '';
		f.password2_admin.value	= '';

		f.name_admin.className		= 'userWhite';
		f.password1_admin.className	= 'userWhite';
		f.password2_admin.className	= 'userWhite';
	} );
}

// delUser 는 무조건 admin 기능으로 바꾸려고 함
function delUser( self ) {
	const f = self.form;
//	if( admin ) {
		const uid = f.idSelect.value
//		const uid = f.uid.value;
		const user = l2data.allUsers[ uid ];
		const userName = user.name || user.id || `* ${uid}`;
		var msg = `${userName} 를 삭제하시겠습니까?`;
//	} else {
//		var msg = '탈퇴하시겠습니까?';
//	}

	if( confirm( msg ) ) {
		const input = {
			uid: uid
		}
		submitUser( 'delUser', input, () => {} );
	}
}

function submitUser( mode, input, cb ) {

	fetchHelper( `/user/${mode}`, input, mode, data => {
		if( data.code == 'OK' ) {
			cb( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onSelectUser( self ) {
	const uid = self.value;
	const user = l2data.allUsers[ uid ];
	if( !user ) {
		return;
	}
//	self.form.uid.value = uid;
	document.querySelector( '#uid_admin' ).innerHTML = uid;
	document.querySelector( '#id_admin' ).innerHTML = user.id;
	document.querySelector( '#name_admin' ).value = user.name;
	document.querySelector( '#del_admin' ).checked = user.deleted ? true : false;
	document.querySelector( '#enable_admin' ).checked = user.enabled ? true : false;
}

function changeUserPage( page ) {
	elem.userList.forEach( o => {
		if( o.className.substr( 1 ) === page ) {
			o.style.display = 'block'
		} else {
			o.style.display = 'none'
		}
	} );
}

function changeLoginData( loginType, loginName, loginID, loginUID ) {

	// Type
	l2data.login.type = loginType;
	if( !loginType ) {
		elem.spanLogin.style.display	= 'inline-block'
		elem.spanRegister.style.display = 'inline-block';
		elem.spanMyInfo.style.display	= 'none';
		elem.spanAdmin.style.display	= 'none';
		elem.spanLogout.style.display	= 'none';
		changeUserPage( 'Login' );
	} else {
		elem.spanLogin.style.display	= 'none';
		elem.spanRegister.style.display	= 'none';
		elem.spanMyInfo.style.display	= 'inline-block';
		elem.spanLogout.style.display	= 'inline-block';

		if( loginType === 'admin' ) {
			elem.spanAdmin.style.display= 'inline-block';
			changeUserPage( 'Admin' );
		} else {
			elem.spanAdmin.style.display= 'none';
			changeUserPage( 'MyInfo' );
		}
	}
	// Name
	l2data.login.name = loginName;
	document.querySelector( '#name_edit' ).value = loginName;
	// ID
	l2data.login.ID = loginID;
	document.querySelector( '#id_edit' ).innerHTML = l2data.login.ID;
	// uid
	l2data.login.uid = loginUID;
}
