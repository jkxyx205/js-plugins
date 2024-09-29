export default function CodeInput(options) {
	this.options = options
	this.id = options.id
	this.options.method = this.options.method ? this.options.method : 'local' 
	this.containerDOM = document.getElementById(this.id)
	this.tableContainerDOM = this.containerDOM.querySelector('.code-input-table')
  this.inputDOM = this.containerDOM.querySelector('.code-input')
  this.dialogIconDOM = this.containerDOM.querySelector('.fa-list')

  this.tableDOM = this.containerDOM.getElementsByTagName('table')[0]
  this.hideHeader = this.tableDOM.getElementsByTagName('thead').length === 0 ? true : false
  let tableBodyDOM = this.tableBodyDOM = this.tableDOM.getElementsByTagName('tbody')[0]

	this.codeInputTableEmptyDOM = this.containerDOM.querySelector('.code-input-table-empty')
	this.search  = this.options.search ? this.options.search.split(/,\s*/) : ['code']

	// init value
	if (this.options.value) {
		_setValue.call(this, this.options.value)
	} else {
		_resetValue(this)
	}

    // 注册事件
    if (this.options.method === 'local') {

		this.inputDOM.addEventListener('focus', (e) => {
			let event = document.createEvent('Event')
			event.initEvent('keyup', true, false)
			this.inputDOM.dispatchEvent(event)
		})

    list_tr((tr) => {
    	tr.addEventListener('click', (e) => {
    		_setTrValue(this, e.target.parentElement)

			})
    })
    }

    if (this.options.reportId) {
    	$(this.dialogIconDOM).dialogReportPicker({
	        reportId: this.options.reportId,
	        class: 'container-search-dialog modal-lg',
	        selectMode: 'single',
	        // value: this.options.value,
	        render: function (value) {

	        },
	        ok: {
	            label: '确定',
	            success: (value, dialog) => {
	                console.log('success', value)
	                let dummyTrDOM = {
	                	dataset: {...value}
	                }
	                _setTrValue.call(this, this, dummyTrDOM)
	                dialog.$modal.modal('hide')
	            }
	        },
	        hidden: function () {
	            console.log('hidden')
	        }
	    })
    }

		this.inputDOM.addEventListener('keydown', e => {
			if (e.keyCode === 38 || e.keyCode === 40) {
				let arrowDown = (e.keyCode === 40)
				for (let child of this.tableBodyDOM.children) {
					if (child.classList.contains('active')) {
						child.classList.remove('active')
						let circle = false
					  let nextChild = child 
						while (true) {
							nextChild = arrowDown ? nextChild.nextElementSibling : nextChild.previousElementSibling
							if (!nextChild) {
								circle = true
								nextChild = arrowDown ? this.tableBodyDOM.firstElementChild : this.tableBodyDOM.lastElementChild
							}

							if (nextChild.style.display !== 'none') {
									break
							}
						}

						nextChild.classList.add('active')

						// 滚动条位置
						let maxHeight = 200
						let tableHeaderHeight = 30
						// let tableContainerDOMHeight = this.hideHeader ? maxHeight : (maxHeight - tableHeaderHeight)
						let tableContainerDOMHeight = (maxHeight - tableHeaderHeight)
						
						if (circle && !arrowDown) {
							this.tableContainerDOM.scrollTop = nextChild.offsetTop
						} else if (circle && arrowDown) {
							this.tableContainerDOM.scrollTop = 0
						}else if (arrowDown && nextChild.offsetTop >= (this.tableContainerDOM.scrollTop + tableContainerDOMHeight)) {
							this.tableContainerDOM.scrollTop = nextChild.offsetTop - tableContainerDOMHeight
						} else if (!arrowDown && nextChild.offsetTop <= this.tableContainerDOM.scrollTop + tableHeaderHeight) {
							this.tableContainerDOM.scrollTop = nextChild.offsetTop - (this.hideHeader ? 0 : tableHeaderHeight)
						}

						break
					}
				}
			} else if (e.keyCode === 13) {
				_setActiveValue.call(this)
			} else {
				this.inputDOM.setAttribute('data-oldvalue', this.inputDOM.value)
			}
		})
 
    this.inputDOM.addEventListener('keyup', debounce((e) => {
    	console.log('input value = ', e.target.value)

    	if ((!e.target.value || e.target.value !== e.target.dataset['oldvalue']) && (!(e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13))) {
    		if (this.options.method === 'local') {
					list_tr((tr) => {
						tr.style.display = 'table-row'
					})

		    	let hasData = false

		    	if (e.target.value) {
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
					
		    	} else {
		    		list_tr((tr) => {
							hasData = true
						})
		    	}

					handlerSearchResult.call(this, hasData)

		    	this.tableContainerDOM.style.top = (e.target.getBoundingClientRect().top + e.target.ownerDocument.defaultView.pageYOffset + 32) + 'px'
	    		this.tableContainerDOM.style.display = 'block'
	    	} else if (e.target.value) { // remote
	    		handlerSearchResult.call(this, false)
	    		empty(this.tableBodyDOM)
	    		$.get("/code-input/" + this.options.remoteKey, { code: e.target.value })
				  .done(res => {
					    console.log( "Data Loaded data: ",  res)
					    if (res.data.length > 0) {
					    	// handlerSearchResult.call(this, true)

					    	for (let row of res.data) {
								const trDOM = document.createElement("tr")

								for (let p in row) {
									trDOM.setAttribute('data-' + p, row[p])

									if (p === 'id') {
										continue
									}
									let tdDOM = document.createElement("td")
									tdDOM.appendChild(document.createTextNode(row[p]))
									trDOM.appendChild(tdDOM)
								}
							 	
							 	trDOM.addEventListener('click', (e) => {
						    		_setTrValue(this, e.target.parentElement)
								})

								this.tableBodyDOM.appendChild(trDOM)
								handlerSearchResult.call(this, true)
					    	}
					    } else {
								// handlerSearchResult.call(this, false)
					    }

							this.tableContainerDOM.style.top = (e.target.getBoundingClientRect().top + e.target.ownerDocument.defaultView.pageYOffset + 32) + 'px'
					    this.tableContainerDOM.style.display = 'block'
						})
		    	} else {
		    		this.tableContainerDOM.style.display = 'none'
		    	}
	    	}
    }))

	this.inputDOM.addEventListener('blur', (e) => {
		console.log('input blur...')

		let trs = _getListTrs()
		if (!this.inputDOM.value || (trs.length !== 1 && this.tableContainerDOM.style.display !== 'none')) {
			_resetValue(this)
		}

		this.inputDOM.value && trs.length == 1 && _setActiveValue.call(this)

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

		function _getListTrs() {
				let trs = []
				list_tr(tr => {
					if (tr.style.display !== 'none') {
						trs.push(tr)
				}	
			})

				return trs
		}

		function _setActiveValue() {
			list_tr(tr => {
					if (tr.classList.contains('active')) {
						_setTrValue(this, tr)
					this.tableContainerDOM.style.display = 'none'
					return true
				}	
			})
		}

    function _setValue(value) {
    	if (this.options.method === 'local') {
  			if (typeof this.options.value === 'object') {
  					value = options.value.code
				}

    		// 筛选
				list_tr((tr) => {
					if (tr.dataset['code'] === value) {
						_setTrValue(this, tr)
						return true
					} 
				})
    	} else {
    			let dummyTrDOM = document.createElement("tr")

          for (let p in value) {
          	dummyTrDOM.setAttribute('data-' + p, value[p] ? value[p] : '')
          }

          this.tableBodyDOM.appendChild(dummyTrDOM)
          _setTrValue.call(this, this, dummyTrDOM)
    	}
    }

    CodeInput.prototype.setValue = _setValue

    function list_tr(consumer) {
    	let trsDom = tableBodyDOM.getElementsByTagName('tr')
	    for (let tr of trsDom) {
	    	if (consumer(tr)) {
	    		break
	    	}
	    }
    }

    function _setTrValue(object, trDOM) {
			object.inputDOM.value = trDOM.dataset[object.options.input || 'code']
    	for(let p in trDOM.dataset) {
    		object.inputDOM.dataset[p] = trDOM.dataset[p]
    	}

    	object.options.afterSetValue && object.options.afterSetValue(object.getValue())
    }

    function _resetValue(object) {
    	for(let p in object.inputDOM.dataset) {
    		object.inputDOM.dataset[p] = ''
    	}
    }

    function empty(element) {
		  while(element.firstElementChild) {
		     element.firstElementChild.remove();
		  }
		}

	function handlerSearchResult(hasData) {
		console.log('hasData = ', hasData)
		if (hasData) {
			this.codeInputTableEmptyDOM.style.display = 'none'
			// 默认选中第一个
			let isFirst = false
			for (let child of this.tableBodyDOM.children) {
				if (!isFirst && child.style.display !== 'none') {
					child.classList.add('active')
					isFirst = true
				} else {
					child.classList.remove('active')
				}
			}
			this.tableContainerDOM.scrollTop = 0
		} else {
			list_tr(tr => {
				tr.classList.remove('active')
			})
			this.codeInputTableEmptyDOM.style.display = 'block'
		}
	}
}

CodeInput.prototype.getValue = function() {
	return {
		...this.inputDOM.dataset
	}
}

CodeInput.prototype.valid = function() {
	return this.inputDOM.value ? !!this.getValue().id : true
}

// https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  }
}
