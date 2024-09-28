export default function CodeInput(options) {
	this.options = options
	this.id = options.id
	this.containerDOM = document.getElementById(this.id)
	this.tableContainerDOM = this.containerDOM.querySelector('.code-input-table')
    this.inputDOM = this.containerDOM.querySelector('.code-input')
    this.tableDOM = this.containerDOM.getElementsByTagName('table')[0]
    let trsDom = this.tableDOM.querySelector('tbody').getElementsByTagName('tr')
	this.codeInputTableEmptyDOM = this.containerDOM.querySelector('.code-input-table-empty')

	this.search  = this.options.search ? this.options.search.split(/,\s*/) : ['code']

	// init value
	if (this.options.value) {
		if (typeof this.options.value === 'string') {
			_setValue.call(this, this.options.value)
		} else {
			_setValue.call(this, this.options.value.code)	
		}
	} else {
		_resetValue(this)
	}

    // 注册事件
	this.inputDOM.addEventListener('focus', (e) => {
		let event = document.createEvent('Event');
		event.initEvent('keyup', true, false);
		this.inputDOM.dispatchEvent(event);
	})

	this.inputDOM.addEventListener('blur', (e) => {
		console.log('input blur...')
		// 如果只有1个匹配项，直接选择
		// 如果只有0个匹配项，清空value
		_resetValue(this)

    	if (this.inputDOM.value) {
    		_setValue.call(this, this.inputDOM.value)
    	}

    	setTimeout(() => {
    		this.options.blur && this.options.blur(this.getValue())

    		this.tableContainerDOM.style.display = 'none'

    		 // 如果没有值显示错误样式
    		if (this.inputDOM.value) {
				if (!this.getValue().id) {
		    		console.log('invalid value')
		    		this.inputDOM.classList.add('is-invalid')
		    	} else {
		    		this.inputDOM.classList.remove('is-invalid')
		    	}
    		} else {
    			this.inputDOM.classList.remove('is-invalid')
    		}

    	}, 50)
  
	})

    this.inputDOM.addEventListener('keyup', debounce((e) => {
    	this.tableContainerDOM.style.display = 'block'
		list_tr((tr) => {
			tr.style.display = 'table-row'
		})

    	console.log('input value = ', e.target.value)

    	let hasData = false

    	if (e.target.value) {
    		// 筛选

    		// TODO 服务端查询数据

			list_tr((tr) => {
				let matches = false
				for (let prop of this.search) {
					if (tr.dataset[prop].indexOf(e.target.value) > -1) {
						hasData = true
						matches = true
						break
					}
				}

				if (!matches) {
					tr.style.display = 'none'
				}
			})

			console.log('hasData = ', hasData)
			if (hasData) {
				this.codeInputTableEmptyDOM.style.display = 'none'
			} else {
				this.codeInputTableEmptyDOM.style.display = 'block'
			}
    	}
    }))


    list_tr((tr) => {
    	tr.addEventListener('click', (e) => {
    		// this.inputDOM.value = e.target.parentElement.dataset[this.options.input || 'code']
    		// this.inputDOM.dataset['id'] = e.target.parentElement.dataset['id']
    		// this.inputDOM.dataset['code'] = e.target.parentElement.dataset['code']
    		_setTrValue(this, e.target.parentElement)

    		// this.tableDOM.style.display = 'none'
		})
    })
    

    function list_tr(consumer) {
	    for (let tr of trsDom) {
	    	consumer(tr)
	    }
    }

    function _setValue(value) {
    	// 筛选
		list_tr((tr) => {
			if (tr.dataset['code'] === value) {
				_setTrValue(this, tr)
			} 
		})

    }

    function _setTrValue(object, trDOM) {
		object.inputDOM.value = trDOM.dataset[object.options.input || 'code']

    	// object.inputDOM.dataset['id'] = trDOM.dataset['id']
    	// object.inputDOM.dataset['code'] = trDOM.dataset['code']
    	for(let p in trDOM.dataset) {
    		object.inputDOM.dataset[p] = trDOM.dataset[p]
    	}
    }

    function _resetValue(object) {
    	// object.inputDOM.dataset['id'] = ''
    	// object.inputDOM.dataset['code'] = ''

    	for(let p in object.inputDOM.dataset) {
    		object.inputDOM.dataset[p] = ''
    	}
    }
    
}

CodeInput.prototype.getValue = function() {
	// return {
	// 	id: this.inputDOM.dataset['id'],
	// 	code: this.inputDOM.dataset['code'],
	// }

	return {
		...this.inputDOM.dataset
	}
}

// https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  }
}
