// vieworder.js

l2user = {
	cbUserList() {
		let select = document.querySelector( '#idSelect' );
		removeChildAll( select );

		for( const uid in l2data.allUsers ) {
			let user = l2data.allUsers[uid];
			let option = addElement( select, 'option', '',
				user.name ? user.name : user.id );
			option.value = uid;
		}

		select.form.uid.value = select.value;
	}
}

function checkAddForm( self, getMsg ) {
	const f = self.form;

	let colorID = '';;
	if( f.id.value === '' ) {
		colorID = 'red';
	} else {
		for( const uid in l2data.allUsers ) {
			const user = l2data.allUsers[uid];
			if( f.id.value === user.id || f.id.value === 'admin' ) {
				colorID = 'yellow';
				break;
			}
		}
	}
	f.id.style.backgroundColor = colorID;

	const colorP1 = f.password1_add.value ? '' : 'red';
	f.password1_add.style.backgroundColor = colorP1;

	const colorP2 = ( f.password1_add.value === f.password2_add.value ) ? '' : 'red';
	f.password2_add.style.backgroundColor = colorP2;

	if( !getMsg ) {
		return;
	}

	let empty = 0;
	let msg = '';
	if( colorID === 'yellow' ) {
		msg = 'ID 중복!!!';
	} else if( colorID === 'red' ) {
		empty++;
		msg = 'ID'
	}
	if( colorP1 || colorP2 ) {
		empty++;
		msg = `${msg ? `${msg}, ` : ''}비밀번호`;
	}
	if( empty > 0 ) {
		msg = `${msg}를 정확하게 입력해주세요.`;
	}

	return msg;
}

function checkEditForm( self ) {
	const f = self.form;

	const colorP2 = ( f.password1_edit.value === f.password2_edit.value ) ? '' : 'red';
	f.password2_edit.style.backgroundColor = colorP2;

	if( colorP2 ) {
		return true;
	}
	return false;
}

function addUser( self ) {

	const msg = checkAddForm( self, true );
	if( msg ) {
		alert( msg );
		//alert( 'ID, 비밀번호를 정확하게 입력해주세요.')
		return;
	}

	const f = self.form;
	f.name.value = f.name_add.value;
	f.password.value = f.password1_add.value;

	self.form.mode.value = "add";
	self.form.submit();
}

function editUser( self, admin ) {

	const f = self.form;
	f.name.value = admin ? f.name_admin.value : f.name_edit.value;

	if( admin ) {
		f.password.value = '';
	} else {
		if( checkEditForm( self ) ) {
			alert( '비밀번호가 다릅니다.' );
			return;
		}
		f.password.value = f.password_edit;
	}

	self.form.mode.value = "edit";
	self.form.submit();
}

function delUser( self ) {

	const userName = 'asdf';
	const msg = `${userName} 를 삭제하시겠습니까?`;

	if( confirm( msg ) ) {
		self.form.mode.value = "del";
		self.form.submit();
	}
}

function onChangeUserID( self ) {
	self.form.uid.value = self.value;
}