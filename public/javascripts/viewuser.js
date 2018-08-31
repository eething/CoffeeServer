// vieworder.js

function initUserElem( loginType, loginName, loginID ) {

	l2data.login.type	= loginType;
	l2data.login.name	= loginName;
	l2data.login.ID		= loginID;

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

	changeLoginType( loginType );
}

l2user = {
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

		select.form.uid.value = select.value;
		onSelectUser( select );
	}
}

function logout() {
	fetchHelper( '/auth/logout', null, 'Logout', res => {
		if( res.code == 'OK' ) {
			changeLoginType();
		} else {
			throw new MyError( 500, res );
		}
	} );
}

function login( self ) {
	//f.submit();
	const data = {
		id: self.form.id.value,
		password: self.form.password.value
	}

	fetchHelper( '/auth/login', data, 'Login', res => {
		if( res.code == 'OK' ) {
			changeLoginType( res.admin ? 'admin' : 'user' );
		} else {
			throw new MyError( 500, res );
		}
	} );
}

function checkAddForm( self, getMsg ) {
	const f = self.form;

	let errID = 0;
	if( f.id.value === '' ) {
		errID = 1;
	} else {
		for( const uid in l2data.allUsers ) {
			const user = l2data.allUsers[uid];
			if( f.id.value === user.id || f.id.value === 'admin' ) {
				errID = 2;
				break;
			}
		}
	}
	f.id.className =	( errID === 2 ) ? 'userYellow' :
						( errID === 1 ) ? 'userRed' : 'userWhite';


	const errP1 = f.password1_add.value ? 0 : 1;
	f.password1_add.className = ( errP1 === 1 ) ? 'userRed' : 'userWhite';

	const errP2 = ( f.password1_add.value === f.password2_add.value ) ? 0 : 1;
	f.password2_add.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let empty = 0;
	let msg = '';
	if( errID === 2 ) {
		msg = 'ID 중복!!!';
	} else if( errID === 1 ) {
		empty++;
		msg = 'ID'
	}
	if( errP1 || errP2 ) {
		empty++;
		msg = `${msg ? `${msg}, ` : ''}비밀번호`;
	}
	if( empty > 0 ) {
		msg = `${msg}를 정확하게 입력해주세요.`;
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
	f.name.value = f.name_add.value;
	f.password.value = f.password1_add.value;
	f.mode.value = "add";

	submitUser( f, () => {
		changeLoginType( 'user' );
	} );
}

function checkEditForm( self, admin, getMsg ) {

	const f = self.form;
	const fName = admin ? f.name_admin : f.name_edit;
	const fPassword1 = admin ? f.password1_admin : f.password1_edit;
	const fPassword2 = admin ? f.password2_admin : f.password2_edit;

	let hasChange = fPassword1.value ? true : false;

	const errP2 = ( fPassword1.value === fPassword2.value ) ? 0 : 1;
	fPassword2.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	const uid = document.querySelector( '#uid_admin' ).innerHTML;
	const orgName = admin ? l2data.allUsers[uid].name : l2data.login.name;
	let changeName = ( fName.value === orgName ) ? 0 : 1;
	fName.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let msg;
	if( errP2 ) {
		return '비밀번호가 다릅니다.';
	}

	if( changeName ) {
		hasChange = true;
	}

	if( !hasChange ) {
		msg = '변경사항이 없습니다.'
	}

	return msg;
}

function editUser( self, admin ) {

	const f = self.form;

	const msg = checkEditForm( self, admin, true );
	if( msg ) {
		alert( msg );
		return;
	}

	f.uid.value = admin ? f.uid.value : -1;
	f.name.value = admin ? f.name_admin.value : f.name_edit.value;
	f.password.value = admin ? f.password1_admin.value : f.password1_edit.value;
	f.mode.value = "edit";

	submitUser( f, () => {
	} );
}

function delUser( self ) {

	const userName = 'asdf';
	const msg = `${userName} 를 삭제하시겠습니까?`;

	const f = self.form;
	if( confirm( msg ) ) {
		f.mode.value = "del";
		submitUser( f, () => {
		} );
	}
}

function submitUser( f, cb ) {
	//f.submit();
	const data = {
		mode: f.mode.value,
		uid: f.uid.value,
		id: f.id.value,
		name: f.name.value,
		password: f.password.value
	}

	fetch( '/user', {
			headers: {
				//'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'post',
			body: JSON.stringify( data )
		} )
		.then( res => {
			if( res.ok ) {
				return res.json();
			} else {
				throw new MyError( res.status, { code: 'CFETCH', err: 'FAILED : Post User Edit' } );
			}
		} )
		.then( data => {
			if( data.code == 'OK' ) {
				cb();
			} else {
				throw new MyError( 500, data );
			}
		} )
		.catch( err => {
			// TODO - 에러창에 띄우기
			alert( `${err.status}, ${err.code}, ${err.err}` );
		} );
}

function onSelectUser( self ) {
	const uid = self.value;
	const user = l2data.allUsers[uid];

	self.form.uid.value = self.value;
	document.querySelector( '#uid_admin' ).innerHTML = uid;
	document.querySelector( '#id_admin' ).innerHTML = user.id;
	document.querySelector( '#name_admin' ).value = user.name;
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

function changeLoginType( loginType ) {
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
}
