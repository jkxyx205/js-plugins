import CodeInput from '/src/code-input'


// let codeInput = new CodeInput({
// 	id: 'material-code',
// 	data: [],
// 	input: "code", // 显示的字段 description,
// 	search: 'code, description',
// 	blur: function(value) {
// 		console.log('blur: ', value)
// 	}
// 	// value: '0003',
// 	// value: {
// 	// 	id: "2",
// 	// 	code: "0002",
// 	// }
// })


let codeInput = new CodeInput({
	id: 'material-code',
	input: "code", // 显示的字段 description,
	search: 'code, description',
	blur: function(value) {
		console.log('blur: ', value)
	},
	// method: 'remote',
	// remoteKey: 'users',
	// reportId: "786015805669142528", // 显示 search help
	// value: '0003',
	// value: {
	// 	id: "2",
	// 	code: "0002",
	// }
})

document.getElementById('btn-submit').addEventListener('click', () => {
	let value = codeInput.getValue()
	console.log('value = ', value)
})
